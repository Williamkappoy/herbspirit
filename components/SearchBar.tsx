'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SearchBar() {
  const { t } = useI18n();
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('city', location);
    if (category) params.set('category', category);
    router.push(`/events?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="max-w-3xl mx-auto bg-ink-800/80 backdrop-blur rounded-xl border border-ink-500 p-4 flex flex-col sm:flex-row gap-3"
    >
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('search.keyword_placeholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-sm text-white placeholder-gray-500 focus:border-gold-400/50 focus:outline-none transition"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('search.location_placeholder')}
          className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-sm text-white placeholder-gray-500 focus:border-gold-400/50 focus:outline-none transition"
        />
      </div>
      <div className="flex-1">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-ink-900 border border-ink-500 text-sm text-white focus:border-gold-400/50 focus:outline-none transition"
        >
          <option value="">{t('search.all_categories')}</option>
          <option value="concerts">{t('category.concerts')}</option>
          <option value="spectacles">{t('category.spectacles')}</option>
          <option value="theatre">{t('category.theatre')}</option>
          <option value="festivals">{t('category.festivals')}</option>
          <option value="soirees">{t('category.soirees')}</option>
          <option value="conferences">{t('category.conferences')}</option>
          <option value="sport">{t('category.sport')}</option>
          <option value="culture">{t('category.culture')}</option>
          <option value="loisirs">{t('category.loisirs')}</option>
          <option value="famille">{t('category.famille')}</option>
          <option value="autres">{t('category.autres')}</option>
        </select>
      </div>
      <button type="submit" className="btn-gold px-6 py-2.5 rounded-lg text-sm whitespace-nowrap">
        {t('search.button')}
      </button>
    </form>
  );
}
