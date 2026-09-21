import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Calendar, MapPin, Ticket as TicketIcon, Download } from 'lucide-react';

export default async function BuyerTicketsPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role === 'ORGANIZER') redirect('/dashboard/organizer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const tickets = await prisma.ticket.findMany({
    where: { order: { userId: user.id }, status: { in: ['PAID', 'VALID', 'USED'] } },
    include: {
      event: { include: { venue: true, organizer: true } },
      ticketType: true,
      order: true,
    },
    orderBy: { event: { startDate: 'asc' } },
  });

  // Generate QR code data URLs for each ticket
  const ticketsWithQR = await Promise.all(
    tickets.map(async (tk) => {
      const qrData = JSON.stringify({
        code: tk.uniqueCode,
        event: tk.event.title,
        type: tk.ticketType.name,
        participant: tk.participantName,
      });
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: { dark: '#0a0a0a', light: '#ffffff' },
      });
      return { ticket: tk, qrDataUrl };
    })
  );

  const now = new Date();
  const upcoming = ticketsWithQR.filter((t) => new Date(t.ticket.event.startDate) >= now);
  const past = ticketsWithQR.filter((t) => new Date(t.ticket.event.startDate) < now);
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-500/20 text-green-400',
    VALID: 'bg-green-500/20 text-green-400',
    USED: 'bg-gray-500/20 text-gray-400',
  };

  const renderTicket = ({ ticket: tk, qrDataUrl }: { ticket: any; qrDataUrl: string }) => (
    <div key={tk.id} className="overflow-hidden rounded-xl border border-ink-500 bg-ink-800">
      <div className="flex flex-col sm:flex-row">
        {/* Left: event info */}
        <div className="flex-1 p-5">
          <div className="flex gap-4">
            {tk.event.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tk.event.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/events/${tk.event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1 transition">
                {tk.event.title}
              </Link>
              <p className="text-sm text-gray-500">{tk.ticketType.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(tk.event.startDate).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {tk.event.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {tk.event.venue.name}, {tk.event.venue.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink-500/50">
            <span className="text-xs font-mono text-gold-300/70">{tk.uniqueCode}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tk.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {t(`status.${tk.status}`)}
            </span>
            {tk.participantName && (
              <span className="text-xs text-gray-500">{tk.participantName}</span>
            )}
          </div>
        </div>

        {/* Right: QR code */}
        <div className="flex flex-col items-center justify-center p-5 sm:border-l border-ink-500 bg-ink-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg bg-white p-1" />
          <a
            href={qrDataUrl}
            download={`ticket-${tk.uniqueCode}.png`}
            className="text-xs text-gray-500 hover:text-gold-300 mt-2 flex items-center gap-1 transition"
          >
            <Download className="w-3 h-3" /> {t('buyer.download_ticket')}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('buyer.my_tickets')}</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{t('buyer.upcoming_tickets')} ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-ink-500 bg-ink-800">
            <TicketIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('buyer.no_tickets')}</p>
            <Link href="/events" className="text-gold-400 hover:text-gold-300 text-sm mt-3 inline-block">
              {t('cart.continue_shopping')}
            </Link>
          </div>
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
