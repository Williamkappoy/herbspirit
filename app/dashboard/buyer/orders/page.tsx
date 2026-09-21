import { prisma } from '@/lib/prisma';
import { getTranslations, getLang } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BuyerOrdersPage() {
  const t = await getTranslations();
  const lang = await getLang();
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  if (user.role === 'ORGANIZER') redirect('/dashboard/organizer');
  if (user.role === 'ADMIN') redirect('/dashboard/admin');

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { ticketType: { include: { event: true } } } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('buyer.my_orders')}</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">{t('buyer.no_orders')}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-5 rounded-xl border border-ink-500 bg-ink-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-gold-300">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{parseFloat(order.totalAmount.toString()).toFixed(2)} {t('common.eur')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {t(`status.${order.status}`)}
                  </span>
                </div>
              </div>
              <div className="space-y-1 pt-3 border-t border-ink-500">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-400">
                    <span>{item.ticketType.event.title} — {item.ticketType.name} × {item.quantity}</span>
                    <span>{(parseFloat(item.unitPrice.toString()) * item.quantity).toFixed(2)} {t('common.eur')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
