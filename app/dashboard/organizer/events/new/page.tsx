'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TicketTypeForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  maxPerOrder: string;
}

export default function CreateEventPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    image: '',
    startDate: '',
    startTime: '20:00',
    endDate: '',
    endTime: '23:00',
    venueName: '',
    venueAddress: '',
    venuePostalCode: '',
    venueCity: '',
    venueCountry: 'Belgique',
  });
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: 'Standard', description: '', price: '25', quantity: '100', maxPerOrder: '8' },
  ]);

  const categories = [
    { slug: 'concerts', label: t('category.concerts') },
    { slug: 'spectacles', label: t('category.spectacles') },
    { slug: 'theatre', label: t('category.theatre') },
    { slug: 'festivals', label: t('category.festivals') },
    { slug: 'soirees', label: t('category.soirees') },
    { slug: 'conferences', label: t('category.conferences') },
    { slug: 'sport', label: t('category.sport') },
    { slug: 'culture', label: t('category.culture') },
    { slug: 'loisirs', label: t('category.loisirs') },
    { slug: 'famille', label: t('category.famille') },
    { slug: 'autres', label: t('category.autres') },
  ];

  const steps = [
    t('event_create.step1'),
    t('event_create.step2'),
    t('event_create.step3'),
    t('event_create.step4'),
    t('event_create.step5'),
  ];

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    setError('');

    const startDate = new Date(`${form.startDate}T${form.startTime}`);
    const endDate = form.endDate ? new Date(`${form.endDate}T${form.endTime}`) : null;

    try {
      const res = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          image: form.image,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString(),
          venue: {
            name: form.venueName,
            address: form.venueAddress,
            postalCode: form.venuePostalCode,
            city: form.venueCity,
            country: form.venueCountry,
          },
          ticketTypes: ticketTypes.filter((tt) => tt.name && tt.price && tt.quantity),
          status: publish ? 'PUBLISHED' : 'DRAFT',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(publish ? `/events/${data.slug}` : '/dashboard/organizer/events');
      } else {
        setError(t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    }
    setLoading(false);
  };

  const canNext = () => {
    if (step === 1) return form.title && form.description && form.categoryId;
    if (step === 2) return form.startDate;
    if (step === 3) return form.venueName && form.venueCity;
    if (step === 4) return ticketTypes.some((tt) => tt.name && tt.price && tt.quantity);
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('event_create.title')}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-gold-300' : 'text-gray-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${i + 1 < step ? 'bg-gold-400 text-ink-900 border-gold-400' : i + 1 === step ? 'border-gold-400 text-gold-300' : 'border-ink-400 text-gray-600'}`}>
                {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-xs hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i + 1 < step ? 'bg-gold-400' : 'bg-ink-500'}`} />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-ink-500 bg-ink-800 p-6">
        {/* Step 1: General info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.event_title')}</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.description')}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.category')}</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition">
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.image_url')}</label>
              <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
          </div>
        )}

        {/* Step 2: Date and time */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.start_date')}</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.start_time')}</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.end_date')}</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.start_time')} — Fin</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Venue */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.venue_name')}</label>
              <input type="text" value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.address')}</label>
              <input type="text" value={form.venueAddress} onChange={(e) => setForm({ ...form, venueAddress: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.postal_code')}</label>
                <input type="text" value={form.venuePostalCode} onChange={(e) => setForm({ ...form, venuePostalCode: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.city')}</label>
                <input type="text" value={form.venueCity} onChange={(e) => setForm({ ...form, venueCity: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('event_create.country')}</label>
              <input type="text" value={form.venueCountry} onChange={(e) => setForm({ ...form, venueCountry: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
          </div>
        )}

        {/* Step 4: Ticket types */}
        {step === 4 && (
          <div className="space-y-4">
            {ticketTypes.map((tt, i) => (
              <div key={i} className="p-4 rounded-lg border border-ink-500 bg-ink-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Billet #{i + 1}</span>
                  {ticketTypes.length > 1 && (
                    <button onClick={() => setTicketTypes(ticketTypes.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">{t('event_create.ticket_name')}</label>
                    <input type="text" value={tt.name} onChange={(e) => { const ntt = [...ticketTypes]; ntt[i] = { ...tt, name: e.target.value }; setTicketTypes(ntt); }} className="w-full px-3 py-2 rounded-lg bg-ink-800 border border-ink-500 text-white text-sm focus:border-gold-400/50 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('event_create.ticket_price')}</label>
                    <input type="number" step="0.01" value={tt.price} onChange={(e) => { const ntt = [...ticketTypes]; ntt[i] = { ...tt, price: e.target.value }; setTicketTypes(ntt); }} className="w-full px-3 py-2 rounded-lg bg-ink-800 border border-ink-500 text-white text-sm focus:border-gold-400/50 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('event_create.ticket_quantity')}</label>
                    <input type="number" value={tt.quantity} onChange={(e) => { const ntt = [...ticketTypes]; ntt[i] = { ...tt, quantity: e.target.value }; setTicketTypes(ntt); }} className="w-full px-3 py-2 rounded-lg bg-ink-800 border border-ink-500 text-white text-sm focus:border-gold-400/50 focus:outline-none transition" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setTicketTypes([...ticketTypes, { name: '', description: '', price: '', quantity: '', maxPerOrder: '8' }])} className="w-full py-2.5 rounded-lg border border-dashed border-ink-400 text-sm text-gray-400 hover:border-gold-400/40 hover:text-gold-300 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> {t('event_create.add_ticket_type')}
            </button>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('event_create.summary')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 rounded-lg bg-ink-900"><span className="text-gray-500">{t('event_create.event_title')}</span><span className="text-white">{form.title}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-ink-900"><span className="text-gray-500">{t('event_create.category')}</span><span className="text-white">{categories.find((c) => c.slug === form.categoryId)?.label || '—'}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-ink-900"><span className="text-gray-500">{t('event_create.start_date')}</span><span className="text-white">{form.startDate} {form.startTime}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-ink-900"><span className="text-gray-500">{t('event_create.venue_name')}</span><span className="text-white">{form.venueName}, {form.venueCity}</span></div>
              <div className="p-3 rounded-lg bg-ink-900">
                <span className="text-gray-500">{t('event_create.step4')}</span>
                <div className="mt-2 space-y-1">
                  {ticketTypes.filter((tt) => tt.name).map((tt, i) => (
                    <div key={i} className="flex justify-between text-white">
                      <span>{tt.name}</span>
                      <span>{tt.price} {t('common.eur')} × {tt.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-ink-500">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-ink-700 transition flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" /> {t('event_create.prev')}
            </button>
          ) : <div />}

          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="btn-gold px-5 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5">
              {t('event_create.next')} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => handleSubmit(false)} disabled={loading} className="px-5 py-2 rounded-lg text-sm border border-ink-400 text-gray-300 hover:bg-ink-700 transition disabled:opacity-50">
                {t('event_create.save_draft')}
              </button>
              <button onClick={() => handleSubmit(true)} disabled={loading} className="btn-gold px-5 py-2 rounded-lg text-sm disabled:opacity-50">
                {loading ? t('common.loading') : t('event_create.publish')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
