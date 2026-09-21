import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket, ShoppingBag, Wallet, Calendar } from 'lucide-react';

export default async function BuyerDashboard() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();

  if (!user) redirect('/auth/signin');
  if (user.role === 'ORGANIZER') redirect('/dashboard/organizer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const [upcomingTickets, orders] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        order: { userId: user.id },
        status: { in: ['PAID', 'VALID'] },
        event: { startDate: { gte: new Date() } },
      },
      include: {
        event: { include: { venue: true, category: true } },
        ticketType: true,
      },
      orderBy: { event: { startDate: 'asc' } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { ticketType: { include: { event: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {t('buyer.dashboard')}, {user.firstName || user.email}
      </h1>
      <p className="text-gray-500 mb-8">Kapibana&apos;s Tickets</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Ticket className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{upcomingTickets.length}</p>
              <p className="text-xs text-gray-500">{t('buyer.upcoming_tickets')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><ShoppingBag className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-500">{t('buyer.my_orders')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Wallet className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{totalSpent.toFixed(2)} {t('common.eur')}</p>
              <p className="text-xs text-gray-500">{t('buyer.order_amount')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming tickets */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('buyer.upcoming_tickets')}</h2>
          <Link href="/dashboard/buyer/tickets" className="text-sm text-gold-400 hover:text-gold-300">{t('home.view_all')} →</Link>
        </div>
        {upcomingTickets.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('buyer.no_tickets')}</p>
        ) : (
          <div className="space-y-3">
            {upcomingTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 p-4 rounded-xl border border-ink-500 bg-ink-800">
                {ticket.event.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ticket.event.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/events/${ticket.event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1">{ticket.event.title}</Link>
                  <p className="text-sm text-gray-500">{ticket.ticketType.name}</p>
                  <p className="text-xs text-gray-600">{new Date(ticket.event.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{t('common.status')}</p>
                  <p className="text-sm font-medium text-green-400">{t(`status.${ticket.status}`)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('buyer.my_orders')}</h2>
          <Link href="/dashboard/buyer/orders" className="text-sm text-gold-400 hover:text-gold-300">{t('home.view_all')} →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('buyer.no_orders')}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-ink-500 bg-ink-800">
                <div>
                  <p className="font-mono text-sm text-gold-300">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString(locale)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{parseFloat(order.totalAmount.toString()).toFixed(2)} {t('common.eur')}</p>
                  <p className="text-xs text-green-400">{t(`status.${order.status}`)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
