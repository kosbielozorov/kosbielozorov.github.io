import AboutMe from '../AboutMe';
import CallToAction from '../CallToAction';
import ContactMe from '../ContactMe';
import Experience from '../Experience';
import Footer from '../Footer';
import Header from '../Header';
import Home from '../Home';

import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { usePortfolioData } from '../../info';

function MainLayout() {
  const dataInfo = usePortfolioData();
  const { i18n } = useTranslation();
  const { name, secondName, position } = dataInfo.first;
  const htmlLang = (i18n.resolvedLanguage || i18n.language || 'en')
    .toLowerCase()
    .startsWith('uk')
    ? 'uk'
    : 'en';

  return (
    <>
      <Helmet htmlAttributes={{ lang: htmlLang }}>
        <title>{`${name} ${secondName} | ${position}`}</title>
        <meta name="description" content={dataInfo.summary.description} />
        <meta
          property="og:title"
          content={`${name} ${secondName} | ${position}`}
        />
        <meta
          property="og:description"
          content={dataInfo.summary.description}
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`${name} ${secondName} | ${position}`}
        />
        <meta
          name="twitter:description"
          content={dataInfo.summary.description}
        />
      </Helmet>
      <Header />
      <Home />
      <Experience />
      <AboutMe />
      <ContactMe />
      <Footer />
      <CallToAction />
    </>
  );
}

export default MainLayout;
