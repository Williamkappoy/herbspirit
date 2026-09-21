'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';

export default function SignInPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/buyer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      router.push(redirect);
    } else {
      setError(t('auth.error_invalid'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">{t('auth.signin_title')}</h1>
        <p className="text-center text-gray-500 mb-8">Kapibana&apos;s Tickets</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? t('common.loading') : t('auth.signin_button')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.no_account')}{' '}
          <a href="/auth/signup" className="text-gold-400 hover:text-gold-300">{t('auth.signup_button')}</a>
        </p>

        {/* Demo accounts */}
        <div className="mt-8 p-4 rounded-xl border border-ink-500 bg-ink-800">
          <p className="text-xs text-gray-500 mb-2">{t('auth.demo_accounts')}</p>
          <div className="space-y-1 text-xs text-gray-400">
            <button onClick={() => { setEmail('buyer@demo.be'); setPassword('buyer123'); }} className="block w-full text-left hover:text-gold-300">
              👤 Acheteur: buyer@demo.be / buyer123
            </button>
            <button onClick={() => { setEmail('contact@brussels-events.be'); setPassword('organizer123'); }} className="block w-full text-left hover:text-gold-300">
              🎪 Organisateur: contact@brussels-events.be / organizer123
            </button>
            <button onClick={() => { setEmail('admin@kapibana.be'); setPassword('admin123'); }} className="block w-full text-left hover:text-gold-300">
              ⚙️ Admin: admin@kapibana.be / admin123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
