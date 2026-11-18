import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CallToAction() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const backToTop = () => {
    window.scrollTo(0, 0);
    // The button disappears at the top, so move the focus to the first visible header control.
    const target = [
      ...document.querySelectorAll('header a, header button'),
    ].find(
      element => element.offsetParent !== null && !element.closest('[inert]'),
    );
    target?.focus({ preventScroll: true });
  };

  return (
    <div className="print:hidden">
      {isScrolled ? (
        <button
          type="button"
          className="bg-[#e9b200] p-4 w-fit rounded-xl fixed bottom-8 right-8 cursor-pointer z-50 animate-bounce"
          title={t('cta.backToTop')}
          aria-label={t('cta.backToTop')}
          onClick={backToTop}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>
      ) : (
        ''
      )}
    </div>
  );
}
