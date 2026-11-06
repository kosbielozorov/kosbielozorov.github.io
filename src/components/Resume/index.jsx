/* eslint-disable react/prop-types */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { usePortfolioData } from '../../info';
import Job from '../Job';
import Skill from '../Skill';

import Education from '../Education';
import Language from '../Language';
import './resume.css';

const SITE_URL = 'https://kosbielozorov.github.io';
const RESUME_URL = `${SITE_URL}/my-resume`;

/** Extracts the Telegram username from `tg://resolve?domain=x` or `https://t.me/x`. */
function getTelegramHandle(url = '') {
  const match =
    url.match(/[?&]domain=([\w\d_]+)/) || url.match(/t\.me\/([\w\d_]+)/);
  return match ? match[1] : '';
}

const ContactIcon = ({ children, ...props }) => (
  <span className="icon" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#fff"
      {...props}
    >
      {children}
    </svg>
  </span>
);

export default function Resume() {
  const { t, i18n } = useTranslation();
  const dataInfo = usePortfolioData();
  const isUk = (i18n.resolvedLanguage || i18n.language || 'en')
    .toLowerCase()
    .startsWith('uk');
  const htmlLang = isUk ? 'uk' : 'en';
  const resumePdfFile = isUk
    ? 'qa-engineer-k.bielozorov-ua.pdf'
    : 'qa-engineer-k.bielozorov-en.pdf';
  const resumePdfHref = `/download/${resumePdfFile}`;
  const { jobs } = dataInfo.experience;
  const { techSkills, softSkills, toolsSkills } = dataInfo.skills;
  const { name, secondName, position, email, phone, socials } = dataInfo.first;
  const { linkedin, telegram, github } = socials;
  const { description } = dataInfo.summary;
  const { languages, educations } = dataInfo;

  const fullName = `${name} ${secondName}`;
  const pageTitle = `${fullName} – ${position} | ${t('resume.title')}`;
  const telegramHandle = getTelegramHandle(telegram.url);
  const telegramUrl = telegramHandle
    ? `https://t.me/${telegramHandle}`
    : telegram.url;
  const githubLabel = github.url.replace(/^https?:\/\/(www\.)?/, '');
  const currentJob = jobs[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName,
    jobTitle: position,
    email: `mailto:${email}`,
    telephone: phone.replace(/[^\d+]/g, ''),
    url: RESUME_URL,
    image: `${SITE_URL}/images/kos.jpg`,
    sameAs: [linkedin.url, github.url, telegramUrl],
    ...(currentJob && {
      worksFor: { '@type': 'Organization', name: currentJob.companyName },
    }),
    knowsAbout: [...techSkills, ...toolsSkills],
    knowsLanguage: languages.map(language => language.name),
  };

  return (
    <React.Fragment>
      <Helmet htmlAttributes={{ lang: htmlLang }}>
        <title>{pageTitle}</title>
        <meta name="description" content={`${fullName} – ${description}`} />
        <link rel="canonical" href={RESUME_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={RESUME_URL} />
        <meta property="profile:first_name" content={name} />
        <meta property="profile:last_name" content={secondName} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <main
        id="resume"
        className="pt-[250px] pb-[100px] lg:pb-[100px] min-h-screen"
      >
        <div className="container m-auto">
          <p
            className="resume-page-title relative font-extrabold text-5xl text-[#48AFDE] mb-20 -mt-20 md:px-24 px-5"
            aria-hidden="true"
          >
            {t('resume.title')}
          </p>

          <article
            className="resume-grid relative px-5 md:px-24"
            itemScope
            itemType="https://schema.org/Person"
          >
            <header className="resume-profile">
              <div className="header">
                <div className="header__wrapper">
                  <img
                    src="/images/kos.jpg"
                    alt={t('resume.altPhoto')}
                    className="header__foto"
                    title={fullName}
                  />
                  <h1 className="header__name" itemProp="name">
                    {name} <br />
                    <span>{secondName}</span>
                  </h1>
                </div>
                <p
                  className="position-description mt-2 mb-6"
                  itemProp="jobTitle"
                >
                  {position}
                </p>
              </div>
              <address className="summary not-italic">
                <ul className="summary__contacts mt-4 mb-4">
                  <li className="contacts-item">
                    <ContactIcon>
                      <path d="M12.042 23.648c-7.813 0-12.042-4.876-12.042-11.171 0-6.727 4.762-12.125 13.276-12.125 6.214 0 10.724 4.038 10.724 9.601 0 8.712-10.33 11.012-9.812 6.042-.71 1.108-1.854 2.354-4.053 2.354-2.516 0-4.08-1.842-4.08-4.807 0-4.444 2.921-8.199 6.379-8.199 1.659 0 2.8.876 3.277 2.221l.464-1.632h2.338c-.244.832-2.321 8.527-2.321 8.527-.648 2.666 1.35 2.713 3.122 1.297 3.329-2.58 3.501-9.327-.998-12.141-4.821-2.891-15.795-1.102-15.795 8.693 0 5.611 3.95 9.381 9.829 9.381 3.436 0 5.542-.93 7.295-1.948l1.177 1.698c-1.711.966-4.461 2.209-8.78 2.209zm-2.344-14.305c-.715 1.34-1.177 3.076-1.177 4.424 0 3.61 3.522 3.633 5.252.239.712-1.394 1.171-3.171 1.171-4.529 0-2.917-3.495-3.434-5.246-.134z" />
                    </ContactIcon>
                    <a href={`mailto:${email}`} itemProp="email">
                      {email}
                    </a>
                  </li>
                  <li className="contacts-item">
                    <ContactIcon>
                      <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
                    </ContactIcon>
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                      itemProp="telephone"
                    >
                      {phone}
                    </a>
                  </li>
                  <li className="contacts-item">
                    <ContactIcon>
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                    </ContactIcon>
                    <a href={linkedin.url} itemProp="sameAs">
                      {linkedin.name}
                    </a>
                  </li>
                  <li className="contacts-item">
                    <ContactIcon>
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </ContactIcon>
                    <a href={github.url} itemProp="sameAs">
                      {githubLabel}
                    </a>
                  </li>
                  <li className="contacts-item">
                    <ContactIcon
                      style={{
                        fillRule: 'evenodd',
                        clipRule: 'evenodd',
                        strokeLinejoin: 'round',
                        strokeMiterlimit: '1.41421',
                      }}
                    >
                      <path d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z" />
                    </ContactIcon>
                    <a href={telegramUrl}>
                      {telegramHandle
                        ? `t.me/${telegramHandle}`
                        : telegram.name}
                    </a>
                  </li>
                </ul>
              </address>
            </header>

            <div className="resume-main">
              <section
                className="summary-right"
                aria-labelledby="resume-summary"
              >
                <h2
                  id="resume-summary"
                  className="summary__title text-[#e9b200] py-2 font-bold md:text-xl"
                >
                  {t('resume.summary')}
                </h2>
                <p className="summary__description" itemProp="description">
                  {description}
                </p>
              </section>
              <section aria-labelledby="resume-experience">
                <h2
                  id="resume-experience"
                  className="experience__title text-[#e9b200] py-2 font-bold md:text-xl"
                >
                  {t('resume.experience')}
                </h2>
                <ul className="experience__list pb-10">
                  {jobs.map(job => (
                    <li key={job.id} className="experience__list-item">
                      <Job {...job} />
                    </li>
                  ))}
                </ul>
              </section>
              <section className="education" aria-labelledby="resume-education">
                <h2
                  id="resume-education"
                  className="education__title text-[#e9b200] py-2 font-bold md:text-xl"
                >
                  {t('resume.education')}
                </h2>
                <ul className="education__list">
                  {educations.map((education, index) => (
                    <li key={index} className="education__list-item">
                      <Education {...education} />
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="resume-aside">
              <section className="skills" aria-labelledby="resume-skills">
                <h2
                  id="resume-skills"
                  className="skills__title text-[#e9b200] py-2 font-bold mt-6 mb-6 md:text-xl"
                >
                  {t('resume.skills')}
                </h2>
                <div className="technologies">
                  <h3 className="technologies__title mb-4 mt-4 text-[#48AFDE]">
                    {t('resume.technicalSkills')}
                  </h3>
                  <ul className="technologies__list">
                    {techSkills.map((techSkill, index) => (
                      <li key={index} className="technologies__list-item">
                        <Skill skill={techSkill} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="programs">
                  <h3 className="programs__title mt-4 mb-4">
                    {t('resume.programsTools')}
                  </h3>
                  <ul className="programs__list">
                    {toolsSkills.map((toolsSkill, index) => (
                      <li key={index} className="programs__list-item">
                        <Skill skill={toolsSkill} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="soft">
                  <h3 className="soft__title mt-4 mb-4">
                    {t('resume.softSkills')}
                  </h3>
                  <ul className="soft__list">
                    {softSkills.map((softSkill, index) => (
                      <li key={index} className="soft__list-item">
                        <Skill skill={softSkill} />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="languages" aria-labelledby="resume-languages">
                <h2
                  id="resume-languages"
                  className="languages__title text-[#e9b200] py-2 font-bold md:text-xl"
                >
                  {t('resume.languages')}
                </h2>
                <ul className="languages__list">
                  {languages.map((language, index) => (
                    <li key={index} className="languages__list-item">
                      <Language {...language} />
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </article>

          <nav className="resume-actions px-5 md:px-24 text-center flex flex-col sm:flex-row sm:justify-between print:hidden">
            <a
              href={resumePdfHref}
              download={resumePdfFile}
              title={t('resume.downloadTitle')}
              className={`cursor-pointer inline-block bg-[#e9b200] transition-all duration-300 ease-in-out rounded-lg text-white py-3 px-5 font-bold mt-8 uppercase md:py-2 lg:py-3 lg:px-8 md:text-xs lg:text-base md:mt-5 xl:mt-10 hover:bg-[#47AEDE] hover:show-lg transform hover:translate-y-1`}
            >
              {t('resume.download')}
            </a>
            <Link
              to="/#home"
              id="back-to-home"
              title={t('resume.backHomeTitle')}
              className={`cursor-pointer inline-block bg-[#47AEDE] transition-all duration-300 ease-in-out rounded-lg text-white py-3 px-5 font-bold mt-8 uppercase md:py-2 lg:py-3 lg:px-8 md:text-xs lg:text-base md:mt-5 xl:mt-10 hover:bg-[#e9b200] hover:show-lg transform hover:translate-y-1`}
            >
              {t('resume.backHome')}
            </Link>
          </nav>
        </div>
      </main>
    </React.Fragment>
  );
}
