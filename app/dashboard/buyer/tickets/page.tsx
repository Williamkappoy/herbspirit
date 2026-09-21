import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket as TicketIcon, QrCode } from 'lucide-react';

export default async function BuyerTicketsPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role === 'ORGANIZER') redirect('/dashboard/organizer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const tickets = await prisma.ticket.findMany({
    where: { order: { userId: user.id } },
    include: {
      event: { include: { venue: true } },
      ticketType: true,
    },
    orderBy: { event: { startDate: 'asc' } },
  });

  const now = new Date();
  const upcoming = tickets.filter((tk) => new Date(tk.event.startDate) >= now);
  const past = tickets.filter((tk) => new Date(tk.event.startDate) < now);
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  const renderTicket = (tk: any) => (
    <div key={tk.id} className="flex gap-4 p-4 rounded-xl border border-ink-500 bg-ink-800">
      {tk.event.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tk.event.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <Link href={`/events/${tk.event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1">{tk.event.title}</Link>
        <p className="text-sm text-gray-500">{tk.ticketType.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">
          {new Date(tk.event.startDate).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          {tk.event.venue && ` — ${tk.event.venue.name}, ${tk.event.venue.city}`}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-mono text-gold-300/70">{tk.uniqueCode}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${tk.status === 'PAID' || tk.status === 'VALID' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {t(`status.${tk.status}`)}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-lg border border-ink-400 bg-ink-900 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-gray-600" />
        </div>
        <span className="text-xs text-gray-600 mt-1">QR</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('buyer.my_tickets')}</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{t('buyer.upcoming_tickets')} ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('buyer.no_tickets')}</p>
        ) : (
          <div className="space-y-3">{upcoming.map(renderTicket)}</div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('buyer.past_tickets')} ({past.length})</h2>
          <div className="space-y-3 opacity-60">{past.map(renderTicket)}</div>
        </section>
      )}
    </div>
  );
}
