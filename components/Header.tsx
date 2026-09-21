'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n, LANGS, LANG_LABELS, type Lang } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { Menu, X, ShoppingCart, ChevronDown, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const dashboardLink =
    user?.role === 'ADMIN' ? '/dashboard/admin'
    : user?.role === 'ORGANIZER' ? '/dashboard/organizer'
    : '/dashboard/buyer';

  return (
    <header className="sticky top-0 z-50 glass border-b border-ink-500">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-gold-gradient">Kapibana&apos;s Tickets</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/events" className="text-sm text-gray-300 hover:text-gold-300 transition">{t('nav.events')}</Link>
          <Link href="/agenda" className="text-sm text-gray-300 hover:text-gold-300 transition">{t('nav.agenda')}</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gold-300 hover:bg-ink-700 transition"
            >
              {LANG_LABELS[lang].slice(0, 2)} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-ink-500 bg-ink-800 shadow-xl py-1">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-ink-700 transition ${lang === l ? 'text-gold-300' : 'text-gray-300'}`}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-lg text-gray-300 hover:text-gold-300 hover:bg-ink-700 transition">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-400 text-ink-900 text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gold-300 hover:bg-ink-700 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ink-900 font-bold text-xs">
                  {(user.firstName || user.email).charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg border border-ink-500 bg-ink-800 shadow-xl py-1">
                  <div className="px-4 py-2 border-b border-ink-500">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link href={dashboardLink} onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-ink-700 hover:text-gold-300 transition">
                    <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                  </Link>
                  <button onClick={() => { logout(); setUserOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-ink-700 hover:text-red-400 transition">
                    <LogOut className="w-4 h-4" /> {t('nav.signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/signin" className="px-4 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gold-300 transition">
                {t('nav.signin')}
              </Link>
              <Link href="/auth/signup" className="btn-gold px-4 py-1.5 rounded-lg text-sm inline-flex items-center gap-1.5">
                <Ticket className="w-4 h-4" /> {t('nav.signup')}
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-ink-700">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-500 bg-ink-800 px-4 py-4 space-y-3">
          <Link href="/events" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-300 hover:text-gold-300">{t('nav.events')}</Link>
          <Link href="/agenda" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-300 hover:text-gold-300">{t('nav.agenda')}</Link>
          <div className="flex gap-2 pt-2">
            {LANGS.map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded text-xs ${lang === l ? 'bg-gold-400 text-ink-900' : 'bg-ink-700 text-gray-300'}`}>
                {LANG_LABELS[l].slice(0, 2)}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <Link href={dashboardLink} onClick={() => setMobileOpen(false)} className="block text-sm text-gold-300">{t('nav.dashboard')}</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block text-sm text-red-400">{t('nav.signout')}</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg border border-ink-400 text-sm text-gray-300">{t('nav.signin')}</Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-gold px-4 py-2 rounded-lg text-sm">{t('nav.signup')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
