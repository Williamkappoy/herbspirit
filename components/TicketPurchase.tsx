'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useI18n } from '@/lib/i18n';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

interface TicketTypeData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  sold: number;
  maxPerOrder: number;
}

interface TicketPurchaseProps {
  event: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    startDate: string;
  };
  ticketTypes: TicketTypeData[];
}

export default function TicketPurchase({ event, ticketTypes }: TicketPurchaseProps) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string | null>(null);

  const handleAdd = (tt: TicketTypeData) => {
    const qty = quantities[tt.id] || 1;
    addItem(
      {
        ticketTypeId: tt.id,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
        eventImage: event.image || '',
        eventDate: event.startDate,
        ticketName: tt.name,
        price: tt.price,
      },
      qty
    );
    setAdded(tt.id);
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <div className="sticky top-20 rounded-xl border border-ink-500 bg-ink-800 overflow-hidden">
      <div className="p-5 border-b border-ink-500">
        <h2 className="text-lg font-semibold">{t('event.ticket_types')}</h2>
      </div>

      {ticketTypes.length === 0 ? (
        <div className="p-5 text-center text-gray-500 text-sm">{t('event.sold_out')}</div>
      ) : (
        <div className="divide-y divide-ink-500">
          {ticketTypes.map((tt) => {
            const available = tt.quantity - tt.sold;
            const isSoldOut = available <= 0;
            const qty = quantities[tt.id] || 1;

            return (
              <div key={tt.id} className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{tt.name}</h3>
                    {tt.description && <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>}
                  </div>
                  <span className="text-lg font-bold text-gold-300">{tt.price.toFixed(2)} {t('common.eur')}</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {available} {t('event.quantity_available')}
                  </span>
                  {!isSoldOut && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-ink-400 rounded-lg">
                        <button
                          onClick={() => setQuantities((prev) => ({ ...prev, [tt.id]: Math.max(1, (prev[tt.id] || 1) - 1) }))}
                          className="p-1.5 text-gray-400 hover:text-white transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium">{qty}</span>
                        <button
                          onClick={() => setQuantities((prev) => ({ ...prev, [tt.id]: Math.min(tt.maxPerOrder, available, (prev[tt.id] || 1) + 1) }))}
                          className="p-1.5 text-gray-400 hover:text-white transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAdd(tt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                          added === tt.id ? 'bg-green-500/20 text-green-400' : 'btn-gold'
                        }`}
                      >
                        {added === tt.id ? (
                          <><Check className="w-4 h-4" /> ✓</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> {t('event.add_to_cart')}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isSoldOut && (
                  <div className="mt-2 text-center py-2 rounded-lg bg-ink-700 text-gray-500 text-sm">
                    {t('event.sold_out')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="p-5 border-t border-ink-500">
        <Link href="/cart" className="btn-outline-gold w-full px-4 py-2.5 rounded-lg text-sm text-center block">
          {t('cart.title')} →
        </Link>
      </div>
    </div>
  );
}
