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

const SITE_URL = 'https://kosbielozorov.github.io';
const HOME_URL = `${SITE_URL}/`;
/** The preview picture for link previews (absolute: preview bots do not resolve relative URLs). */
const PREVIEW_IMAGE = `${SITE_URL}/images/kos.jpg`;

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
        <link rel="canonical" href={HOME_URL} />
        <meta property="og:url" content={HOME_URL} />
        <meta property="og:image" content={PREVIEW_IMAGE} />
        <meta property="og:image:alt" content={`${name} ${secondName}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={PREVIEW_IMAGE} />
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
      <main>
        <Home />
        <Experience />
        <AboutMe />
        <ContactMe />
      </main>
      <Footer />
      <CallToAction />
    </>
  );
}

export default MainLayout;
