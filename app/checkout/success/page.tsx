'use client';

import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { CheckCircle2, Ticket } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">{t('checkout.success_title')}</h1>
      <p className="text-gray-400 mb-2">{t('checkout.success_message')}</p>
      {orderNumber && (
        <p className="text-sm text-gray-500 mb-8">
          {t('checkout.order_number')}: <span className="text-gold-300 font-mono">{orderNumber}</span>
        </p>
      )}
      <div className="flex gap-4 justify-center">
        <Link href="/dashboard/buyer/tickets" className="btn-gold px-6 py-3 rounded-lg text-sm inline-flex items-center gap-2">
          <Ticket className="w-4 h-4" /> {t('checkout.back_to_tickets')}
        </Link>
        <Link href="/events" className="btn-outline-gold px-6 py-3 rounded-lg text-sm">
          {t('cart.continue_shopping')}
        </Link>
      </div>
    </div>
  );
}
