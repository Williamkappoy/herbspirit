'use client';

import { useCart } from '@/components/CartProvider';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { t } = useI18n();
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const router = useRouter();

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('cart.title')}</h1>
        <p className="text-gray-500 mb-8">{t('cart.empty')}</p>
        <Link href="/events" className="btn-gold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm">
          {t('cart.continue_shopping')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.ticketTypeId} className="flex gap-4 p-4 rounded-xl border border-ink-500 bg-ink-800">
              {item.eventImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.eventImage} alt={item.eventTitle} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/events/${item.eventSlug}`} className="font-medium text-white hover:text-gold-300 transition line-clamp-1">
                  {item.eventTitle}
                </Link>
                <p className="text-sm text-gray-500">{item.ticketName}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(item.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-ink-400 rounded-lg">
                    <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)} className="p-1.5 text-gray-400 hover:text-white">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)} className="p-1.5 text-gray-400 hover:text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gold-300">{(item.price * item.quantity).toFixed(2)} {t('common.eur')}</span>
                    <button onClick={() => removeItem(item.ticketTypeId)} className="text-gray-500 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-ink-500 bg-ink-800 p-5 h-fit sticky top-20">
          <h2 className="font-semibold mb-4">{t('cart.title')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>{t('cart.subtotal')}</span>
              <span>{total.toFixed(2)} {t('common.eur')}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>{t('cart.fees')}</span>
              <span>0.00 {t('common.eur')}</span>
            </div>
            <div className="pt-3 border-t border-ink-500 flex justify-between font-bold text-lg">
              <span>{t('cart.total')}</span>
              <span className="text-gold-300">{total.toFixed(2)} {t('common.eur')}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="btn-gold w-full mt-5 py-3 rounded-lg text-sm font-medium"
          >
            {t('cart.checkout')}
          </button>
          <Link href="/events" className="block text-center text-sm text-gray-500 hover:text-gold-300 mt-3">
            {t('cart.continue_shopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
