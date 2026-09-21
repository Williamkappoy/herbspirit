'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Ticket, Building2 } from 'lucide-react';

export default function SignUpPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [role, setRole] = useState<'BUYER' | 'ORGANIZER'>('BUYER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, role, organizerName }),
    });

    if (res.ok) {
      router.push(role === 'ORGANIZER' ? '/dashboard/organizer' : '/dashboard/buyer');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'exists' ? t('auth.error_exists') : t('common.error'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">{t('auth.signup_title')}</h1>
        <p className="text-center text-gray-500 mb-8">Kapibana&apos;s Tickets</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`p-4 rounded-xl border text-center transition ${role === 'BUYER' ? 'border-gold-400 bg-gold-400/5' : 'border-ink-500 bg-ink-800 hover:border-ink-400'}`}
          >
            <Ticket className={`w-6 h-6 mx-auto mb-2 ${role === 'BUYER' ? 'text-gold-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${role === 'BUYER' ? 'text-gold-300' : 'text-gray-400'}`}>{t('auth.role_buyer')}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('ORGANIZER')}
            className={`p-4 rounded-xl border text-center transition ${role === 'ORGANIZER' ? 'border-gold-400 bg-gold-400/5' : 'border-ink-500 bg-ink-800 hover:border-ink-400'}`}
          >
            <Building2 className={`w-6 h-6 mx-auto mb-2 ${role === 'ORGANIZER' ? 'text-gold-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${role === 'ORGANIZER' ? 'text-gold-300' : 'text-gray-400'}`}>{t('auth.role_organizer')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('auth.first_name')}</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('auth.last_name')}</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
          </div>

          {role === 'ORGANIZER' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('auth.organizer_name')}</label>
              <input type="text" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? t('common.loading') : t('auth.signup_button')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.have_account')}{' '}
          <a href="/auth/signin" className="text-gold-400 hover:text-gold-300">{t('auth.signin_button')}</a>
        </p>
      </div>
    </div>
  );
}
