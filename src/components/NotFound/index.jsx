import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CallToAction from '../CallToAction';
import Footer from '../Footer';
import Header from '../Header';

function NotFound() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const htmlLang = (i18n.resolvedLanguage || i18n.language || 'en')
    .toLowerCase()
    .startsWith('uk')
    ? 'uk'
    : 'en';

  return (
    <>
      <Helmet htmlAttributes={{ lang: htmlLang }}>
        <title>{t('notFound.pageTitle')}</title>
        <meta name="description" content={t('notFound.description')} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main
        id="not-found"
        className="pt-[250px] pb-[100px] min-h-screen print:hidden"
      >
        <div className="container m-auto px-5 md:px-24 text-center max-w-2xl">
          <p className="text-[#47AEDE] font-recoletaBlack text-8xl md:text-9xl leading-none mb-4">
            404
          </p>
          <h1 className="text-[#223740] font-recoletaBlack text-3xl md:text-4xl mb-4">
            {t('notFound.heading')}
          </h1>
          <p className="text-[#223740]/80 text-lg mb-10">
            {t('notFound.description')}
          </p>
          <Link
            to="/"
            className="cursor-pointer inline-block bg-[#47AEDE] transition-all duration-300 ease-in-out rounded-lg text-white py-3 px-8 font-bold uppercase md:text-sm lg:text-base hover:bg-[#e9b200] hover:show-lg transform hover:translate-y-1"
          >
            {t('notFound.backHome')}
          </Link>
        </div>
      </main>
      <Footer />
      <CallToAction />
    </>
  );
}

export default NotFound;
