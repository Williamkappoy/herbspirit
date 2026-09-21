'use client';

import { useI18n } from '@/lib/i18n';

export default function EventStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();

  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    APPROVED: 'bg-blue-500/20 text-blue-400',
    PUBLISHED: 'bg-green-500/20 text-green-400',
    SUSPENDED: 'bg-red-500/20 text-red-400',
    COMPLETED: 'bg-purple-500/20 text-purple-400',
    ARCHIVED: 'bg-gray-500/20 text-gray-500',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {t(`status.${status}`, status)}
    </span>
  );
}
