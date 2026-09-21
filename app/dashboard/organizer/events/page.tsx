import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import EventStatusBadge from '@/components/EventStatusBadge';

export default async function OrganizerEventsPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role === 'BUYER') redirect('/dashboard/buyer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const organizer = await prisma.organizerProfile.findFirst({
    where: { userId: user.id },
    include: {
      events: {
        include: { ticketTypes: true, category: true, venue: true },
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!organizer) redirect('/auth/signup');

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('organizer.my_events')}</h1>
        <Link href="/dashboard/organizer/events/new" className="btn-gold px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('organizer.create_event')}
        </Link>
      </div>

      {organizer.events.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">{t('organizer.no_events')}</p>
      ) : (
        <div className="space-y-3">
          {organizer.events.map((event) => {
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
                  <div className="flex items-center gap-2">
                    <Link href={`/events/${event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1">{event.title}</Link>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {event.venue && ` — ${event.venue.city}`}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{sold}/{totalCap} {t('common.tickets')}</span>
                    <span>{revenue.toFixed(0)} {t('common.eur')}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <Link href={`/events/${event.slug}`} className="p-2 rounded-lg text-gray-400 hover:text-gold-300 hover:bg-ink-700 transition">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
