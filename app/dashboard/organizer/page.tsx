import { prisma } from '@/lib/prisma';
import { getTranslations } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Ticket, Wallet, TrendingUp, Plus, Percent } from 'lucide-react';

export default async function OrganizerDashboard() {
  const t = await getTranslations();
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

  const eventIds = organizer.events.map((e) => e.id);
  const activeEvents = organizer.events.filter(
    (e) => e.status === 'PUBLISHED' && new Date(e.startDate) >= new Date()
  );
  const totalTicketsSold = organizer.events.reduce(
    (sum, e) => sum + e.ticketTypes.reduce((s, tt) => s + tt.sold, 0),
    0
  );

  const orders = await prisma.order.findMany({
    where: { items: { some: { ticketType: { event: { organizerId: organizer.id } } } } },
    include: {
      items: { include: { ticketType: { include: { event: true } } } },
      commission: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const totalCommission = orders.reduce(
    (sum, o) => sum + (o.commission ? parseFloat(o.commission.commissionAmount.toString()) : 0),
    0
  );
  const netAmount = totalRevenue - totalCommission;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('organizer.dashboard')}</h1>
          <p className="text-gray-500">{organizer.name}</p>
        </div>
        <Link href="/dashboard/organizer/events/new" className="btn-gold px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('organizer.create_event')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Calendar className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{activeEvents.length}</p>
              <p className="text-xs text-gray-500">{t('organizer.active_events')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Ticket className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{totalTicketsSold}</p>
              <p className="text-xs text-gray-500">{t('organizer.tickets_sold')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Wallet className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{totalRevenue.toFixed(0)} {t('common.eur')}</p>
              <p className="text-xs text-gray-500">{t('organizer.revenue')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Percent className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold text-red-400">{totalCommission.toFixed(0)} {t('common.eur')}</p>
              <p className="text-xs text-gray-500">{t('organizer.commission')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><TrendingUp className="w-5 h-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold text-green-400">{netAmount.toFixed(0)} {t('common.eur')}</p>
              <p className="text-xs text-gray-500">{t('organizer.net_amount')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/organizer/events" className="px-4 py-2 rounded-lg border border-ink-500 text-sm text-gray-300 hover:border-gold-400/40 transition">
          {t('organizer.my_events')}
        </Link>
        <Link href="/dashboard/organizer/sales" className="px-4 py-2 rounded-lg border border-ink-500 text-sm text-gray-300 hover:border-gold-400/40 transition">
          {t('organizer.my_sales')}
        </Link>
      </div>

      {/* Recent sales */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('organizer.recent_sales')}</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('organizer.no_events')}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-ink-500 bg-ink-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-gold-300">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {order.items.map((i) => `${i.ticketType.event.title} × ${i.quantity}`).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{parseFloat(order.totalAmount.toString()).toFixed(2)} {t('common.eur')}</p>
                  <p className="text-xs text-green-400">{t('status.PAID')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
