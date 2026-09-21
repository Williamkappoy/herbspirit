import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations();
  const lang = await getLang();

  const now = new Date();
  const year = parseInt((searchParams.year as string) || String(now.getFullYear()));
  const month = parseInt((searchParams.month as string) || String(now.getMonth() + 1));

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDate: { gte: firstDay, lte: lastDay },
    },
    include: { organizer: true, category: true, venue: true, ticketTypes: true },
    orderBy: { startDate: 'asc' },
  });

  // Group by day
  const eventsByDay: Record<string, typeof events> = {};
  for (const e of events) {
    const day = new Date(e.startDate).getDate().toString();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  }

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';
  const monthName = firstDay.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('agenda.title')}</h1>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <Link href={`/agenda?year=${prevMonth.year}&month=${prevMonth.month}`} className="p-2 rounded-lg border border-ink-500 text-gray-300 hover:border-gold-400/40 transition">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Link href={`/agenda?year=${nextMonth.year}&month=${nextMonth.month}`} className="p-2 rounded-lg border border-ink-500 text-gray-300 hover:border-gold-400/40 transition">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayEvents = eventsByDay[day.toString()] || [];
          const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();
          return (
            <Link
              key={day}
              href={dayEvents.length > 0 ? `#day-${day}` : '#'}
              className={`aspect-square rounded-lg border p-1.5 flex flex-col ${dayEvents.length > 0 ? 'border-gold-400/30 bg-gold-400/5 hover:bg-gold-400/10' : 'border-ink-500 bg-ink-800'} ${isToday ? 'ring-1 ring-gold-400' : ''}`}
            >
              <span className={`text-xs ${isToday ? 'text-gold-300 font-bold' : 'text-gray-400'}`}>{day}</span>
              {dayEvents.length > 0 && (
                <div className="flex-1 flex items-end">
                  <span className="text-xs text-gold-300">{dayEvents.length} {t('home.events')}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Events list */}
      {events.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 capitalize">{monthName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="mt-10 text-center py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">{t('agenda.no_events')}</p>
        </div>
      )}
    </div>
  );
}
