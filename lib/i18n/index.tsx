'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Lang, LANG_LABELS, LANGS } from './translations';

type TranslationFn = (key: string, fallback?: string) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationFn;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const match = document.cookie.match(/lang=(fr|nl|en)/);
    if (match) setLangState(match[1] as Lang);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    document.cookie = `lang=${newLang};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const t: TranslationFn = useCallback(
    (key: string, fallback?: string) => {
      const tr = translations[key];
      if (!tr) return fallback || key;
      return tr[lang] || tr.fr || fallback || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { LANGS, LANG_LABELS };
export type { Lang };
