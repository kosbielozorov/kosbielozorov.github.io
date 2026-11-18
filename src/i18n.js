import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import uk from './locales/uk/translation.json';

function syncHtmlLang(lng) {
  const code = (lng || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';
  document.documentElement.lang = code;
}

i18n.on('languageChanged', syncHtmlLang);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      resources: {
        en: { translation: en },
        uk: { translation: uk },
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'uk'],
      load: 'languageOnly',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    },
    () => {
      syncHtmlLang(i18n.language);
    },
  );

export default i18n;
