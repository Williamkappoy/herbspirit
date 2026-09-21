import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OrganizerSalesPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role === 'BUYER') redirect('/dashboard/buyer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const organizer = await prisma.organizerProfile.findFirst({ where: { userId: user.id } });
  if (!organizer) redirect('/auth/signup');

  const events = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    include: { ticketTypes: true, venue: true },
    orderBy: { startDate: 'desc' },
  });

  const orders = await prisma.order.findMany({
    where: { items: { some: { ticketType: { event: { organizerId: organizer.id } } } }, status: 'PAID' },
    include: {
      items: { include: { ticketType: { include: { event: true } } } },
      commission: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalGross = orders.reduce((s, o) => s + parseFloat(o.totalAmount.toString()), 0);
  const totalCommission = orders.reduce((s, o) => s + (o.commission ? parseFloat(o.commission.commissionAmount.toString()) : 0), 0);
  const totalNet = totalGross - totalCommission;
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  // Per-event breakdown
  const eventStats = events.map((e) => {
    const eventOrders = orders.filter((o) => o.items.some((i) => i.ticketType.eventId === e.id));
    const gross = eventOrders.reduce((s, o) => s + parseFloat(o.totalAmount.toString()), 0);
    const commission = eventOrders.reduce((s, o) => s + (o.commission ? parseFloat(o.commission.commissionAmount.toString()) : 0), 0);
    const sold = e.ticketTypes.reduce((s, tt) => s + tt.sold, 0);
    return { event: e, gross, commission, net: gross - commission, sold, orderCount: eventOrders.length };
  }).filter((s) => s.orderCount > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('organizer.my_revenue')}</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <p className="text-xs text-gray-500 mb-1">{t('organizer.revenue')}</p>
          <p className="text-2xl font-bold">{totalGross.toFixed(2)} {t('common.eur')}</p>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <p className="text-xs text-gray-500 mb-1">{t('organizer.commission')} (5%)</p>
          <p className="text-2xl font-bold text-red-400">{totalCommission.toFixed(2)} {t('common.eur')}</p>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <p className="text-xs text-gray-500 mb-1">{t('organizer.net_amount')}</p>
          <p className="text-2xl font-bold text-green-400">{totalNet.toFixed(2)} {t('common.eur')}</p>
        </div>
      </div>

      {/* Per event */}
      {eventStats.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">{t('organizer.my_events')}</h2>
          <div className="space-y-3">
            {eventStats.map(({ event, gross, commission, net, sold, orderCount }) => (
              <div key={event.id} className="p-4 rounded-xl border border-ink-500 bg-ink-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{event.title}</span>
                  <span className="text-xs text-gray-500">{orderCount} commandes · {sold} billets</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-gray-500">Brut: </span><span className="text-white">{gross.toFixed(2)} {t('common.eur')}</span></div>
                  <div><span className="text-gray-500">Commission: </span><span className="text-red-400">{commission.toFixed(2)} {t('common.eur')}</span></div>
                  <div><span className="text-gray-500">Net: </span><span className="text-green-400">{net.toFixed(2)} {t('common.eur')}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('organizer.recent_sales')}</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('organizer.no_events')}</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-ink-500 bg-ink-800 text-sm">
                <div>
                  <span className="font-mono text-gold-300">{order.orderNumber}</span>
                  <span className="text-gray-500 ml-3">{order.user.firstName} {order.user.lastName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{parseFloat(order.totalAmount.toString()).toFixed(2)} {t('common.eur')}</span>
                  <span className="text-xs text-green-400 ml-2">{t('status.PAID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
