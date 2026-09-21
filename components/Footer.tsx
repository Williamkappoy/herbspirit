'use client';

import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-500 bg-ink-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-gold-gradient mb-2">Kapibana&apos;s Tickets</h3>
            <p className="text-sm text-gray-500 max-w-sm">{t('footer.tagline')}</p>
            <p className="text-xs text-gray-600 mt-2">Kapibana&apos;s Eve — Belgique</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">{t('nav.events')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/events" className="hover:text-gold-300 transition">{t('nav.events')}</a></li>
              <li><a href="/agenda" className="hover:text-gold-300 transition">{t('nav.agenda')}</a></li>
              <li><a href="/dashboard/organizer/events/new" className="hover:text-gold-300 transition">{t('home.organizer_cta_button')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gold-300 transition">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-gold-300 transition">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-gold-300 transition">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-600 text-center">
          <p className="text-xs text-gray-600">© {year} Kapibana&apos;s Tickets — {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
