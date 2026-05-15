/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import fr from './locales/fr.json';
import en from './locales/en.json';

const dictionaries = { fr, en };
const LanguageContext = createContext(null);

function getInitialLanguage() {
  const stored = localStorage.getItem('portfolio_language');
  return stored === 'en' || stored === 'fr' ? stored : 'fr';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('portfolio_language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const value = useMemo(() => {
    const t = (key, replacements = {}) => {
      const template = dictionaries[language][key] ?? dictionaries.fr[key] ?? key;

      return Object.entries(replacements).reduce(
        (text, [name, replacement]) => text.replaceAll(`{{${name}}}`, replacement ?? ''),
        template,
      );
    };

    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === 'fr' ? 'en' : 'fr')),
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslation must be used inside LanguageProvider');
  }

  return context;
}
