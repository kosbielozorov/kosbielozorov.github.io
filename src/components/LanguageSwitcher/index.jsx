/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';

/** Each language named in itself, with the code the button shows (WCAG 2.5.3: label in name). */
const LANGUAGE_NAMES = { en: 'English (EN)', uk: 'Українська (UA)' };

export default function LanguageSwitcher({ className = '', onDark = false }) {
  const { i18n, t } = useTranslation();

  const active = code =>
    (i18n.resolvedLanguage || i18n.language || 'en')
      .toLowerCase()
      .startsWith(code);

  const activeClass = onDark
    ? 'text-[#e9b200] underline decoration-white decoration-2 underline-offset-4'
    : 'text-black underline decoration-[#e9b200] decoration-2 underline-offset-4';
  const idleClass = onDark
    ? 'text-white/80 hover:text-white transition-colors'
    : 'text-[#e9b200] hover:text-black transition-colors';
  const sepClass = onDark ? 'text-white/50' : 'text-[#77787b]';

  return (
    <div
      className={`flex items-center gap-1 text-sm font-recoletaBlack uppercase ${className}`}
      role="group"
      aria-label={t('langSwitcher.label')}
    >
      <button
        type="button"
        lang="en"
        aria-label={LANGUAGE_NAMES.en}
        aria-pressed={active('en')}
        onClick={() => i18n.changeLanguage('en')}
        className={active('en') ? activeClass : idleClass}
      >
        {t('langSwitcher.en')}
      </button>
      <span className={`${sepClass} select-none`} aria-hidden>
        |
      </span>
      <button
        type="button"
        lang="uk"
        aria-label={LANGUAGE_NAMES.uk}
        aria-pressed={active('uk')}
        onClick={() => i18n.changeLanguage('uk')}
        className={active('uk') ? activeClass : idleClass}
      >
        {t('langSwitcher.uk')}
      </button>
    </div>
  );
}
