import { cookies } from 'next/headers';
import { translations, type Lang } from './translations';

export async function getLang(): Promise<Lang> {
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value as Lang | undefined;
  return lang && ['fr', 'nl', 'en'].includes(lang) ? lang : 'fr';
}

export async function getTranslations() {
  const lang = await getLang();
  return (key: string, fallback?: string) => {
    const t = translations[key];
    if (!t) return fallback || key;
    return t[lang] || t.fr || fallback || key;
  };
}
