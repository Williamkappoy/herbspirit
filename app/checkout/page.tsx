'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { t } = useI18n();
  const { items, total, count, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [terms, setTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/checkout');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-gold-400" /></div>;
  }

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{t('cart.empty')}</p>
        <Link href="/events" className="text-gold-400 hover:text-gold-300">{t('cart.continue_shopping')}</Link>
      </div>
    );
  }

  const commissionRate = 5;
  const commission = total * commissionRate / 100;

  const handlePay = async () => {
    if (!terms) {
      setError(t('checkout.terms'));
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError(t('checkout.required_fields'));
      return;
    }
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          buyerInfo: { firstName, lastName, email, phone },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left: forms */}
        <div className="space-y-6">
          {/* Buyer info */}
          <div className="rounded-xl border border-ink-500 bg-ink-800 p-5">
            <h2 className="font-semibold mb-4">{t('checkout.buyer_info')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('checkout.first_name')}</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('checkout.last_name')}</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('checkout.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('checkout.phone')}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
            </div>
          </div>

          {/* Payment (simulated Base44 Payments) */}
          <div className="rounded-xl border border-ink-500 bg-ink-800 p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-400" /> {t('checkout.payment')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Card number</label>
                <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Expiry</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">CVC</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none transition" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Base44 Payments — Secured payment
            </p>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-gold-400" />
            {t('checkout.terms')}
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Right: summary */}
        <div className="rounded-xl border border-ink-500 bg-ink-800 p-5 h-fit sticky top-20">
          <h2 className="font-semibold mb-4">{t('cart.title')}</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={item.ticketTypeId} className="flex justify-between text-sm text-gray-400">
                <span className="line-clamp-1">{item.ticketName} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} {t('common.eur')}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-ink-500 pt-3">
            <div className="flex justify-between text-gray-400">
              <span>{t('cart.subtotal')}</span>
              <span>{total.toFixed(2)} {t('common.eur')}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>{t('checkout.commission_info')}</span>
              <span>{commission.toFixed(2)} {t('common.eur')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-ink-500">
              <span>{t('cart.total')}</span>
              <span className="text-gold-300">{total.toFixed(2)} {t('common.eur')}</span>
            </div>
          </div>
          <button
            onClick={handlePay}
            disabled={processing || !terms}
            className="btn-gold w-full mt-5 py-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</> : <>{t('checkout.pay')} — {total.toFixed(2)} {t('common.eur')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
