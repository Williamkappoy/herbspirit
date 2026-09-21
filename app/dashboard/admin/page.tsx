import { prisma } from '@/lib/prisma';
import { getTranslations } from '@/lib/i18n/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Calendar, Wallet, Percent, AlertCircle } from 'lucide-react';
import ModerationButtons from '@/components/ModerationButtons';

export default async function AdminDashboard() {
  const t = await getTranslations();
  const user = await getCurrentUser();

  if (!user) redirect('/auth/signin');
  if (user.role !== 'ADMIN') redirect('/dashboard/buyer');

  const [totalUsers, totalOrganizers, totalEvents, publishedEvents, pendingEvents, orders] = await Promise.all([
    prisma.user.count(),
    prisma.organizerProfile.count(),
    prisma.event.count(),
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.findMany({
      where: { status: 'PENDING' },
      include: { organizer: true, category: true, venue: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      include: { commission: true },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const totalCommissions = orders.reduce(
    (sum, o) => sum + (o.commission ? parseFloat(o.commission.commissionAmount.toString()) : 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('admin.dashboard')}</h1>
      <p className="text-gray-500 mb-8">Kapibana&apos;s Tickets — Back-office</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Users className="w-5 h-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalUsers}</p><p className="text-xs text-gray-500">{t('admin.total_users')}</p></div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Calendar className="w-5 h-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalEvents}</p><p className="text-xs text-gray-500">{t('admin.total_events')}</p></div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Wallet className="w-5 h-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalRevenue.toFixed(0)} {t('common.eur')}</p><p className="text-xs text-gray-500">{t('admin.total_revenue')}</p></div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Percent className="w-5 h-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalCommissions.toFixed(0)} {t('common.eur')}</p><p className="text-xs text-gray-500">{t('admin.total_commissions')}</p></div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-ink-500 bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-400/10"><Users className="w-5 h-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalOrganizers}</p><p className="text-xs text-gray-500">{t('admin.organizers')}</p></div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/dashboard/admin/events" className="px-4 py-2 rounded-lg border border-ink-500 text-sm text-gray-300 hover:border-gold-400/40 transition">{t('admin.events')}</Link>
        <Link href="/dashboard/admin/categories" className="px-4 py-2 rounded-lg border border-ink-500 text-sm text-gray-300 hover:border-gold-400/40 transition">{t('admin.categories')}</Link>
      </div>

      {/* Pending events */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          {t('admin.pending_events')} ({pendingEvents.length})
        </h2>
        {pendingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('admin.no_pending')}</p>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border border-ink-500 bg-ink-800">
                {event.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/events/${event.slug}`} className="font-medium text-white hover:text-gold-300 line-clamp-1">{event.title}</Link>
                  <p className="text-sm text-gray-500">{event.organizer.name}</p>
                  <p className="text-xs text-gray-600">{new Date(event.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <ModerationButtons eventId={event.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


