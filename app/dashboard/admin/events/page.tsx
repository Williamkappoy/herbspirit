import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ModerationButtons from '@/components/ModerationButtons';
import EventStatusBadge from '@/components/EventStatusBadge';

export default async function AdminEventsPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role !== 'ADMIN') redirect('/dashboard/buyer');

  const events = await prisma.event.findMany({
    include: { organizer: true, category: true, venue: true, ticketTypes: true },
    orderBy: { createdAt: 'desc' },
  });

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.events')}</h1>

      <div className="space-y-3">
        {events.map((event) => {
          const sold = event.ticketTypes.reduce((s, tt) => s + tt.sold, 0);
          const totalCap = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
          const revenue = event.ticketTypes.reduce((s, tt) => s + tt.sold * parseFloat(tt.price.toString()), 0);

          return (
            <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-ink-500 bg-ink-800">
              {event.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/events/${event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1">{event.title}</Link>
                  <EventStatusBadge status={event.status} />
                </div>
                <p className="text-xs text-gray-500">{event.organizer.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {new Date(event.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  {event.venue && ` — ${event.venue.city}`}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{sold}/{totalCap} {t('common.tickets')}</span>
                  <span>{revenue.toFixed(0)} {t('common.eur')}</span>
                </div>
              </div>
              {event.status === 'PENDING' && (
                <div className="shrink-0 flex items-center">
                  <ModerationButtons eventId={event.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
