'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ModerationButtons({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const router = useRouter();

  const handleAction = async (action: string) => {
    await fetch(`/api/admin/events?id=${eventId}&action=${action}`, { method: 'POST' });
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approve')}
        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition flex items-center gap-1"
      >
        <CheckCircle className="w-3.5 h-3.5" /> {t('admin.approve')}
      </button>
      <button
        onClick={() => handleAction('reject')}
        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition flex items-center gap-1"
      >
        <XCircle className="w-3.5 h-3.5" /> {t('admin.reject')}
      </button>
    </div>
  );
}
