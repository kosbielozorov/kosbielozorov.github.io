/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Job({
  fromYear,
  fromMonth,
  toYear,
  toMonth,
  companyName,
  companyCity,
  position,
  responsibilities,
  achievements,
}) {
  const { t } = useTranslation();
  const start = [fromMonth, fromYear].filter(Boolean).join(' ');
  const end = [toMonth, toYear].filter(Boolean).join(' ');

  return (
    <React.Fragment>
      {/* Text first in DOM so parsers read "title → company → dates"; the badge is decorative. */}
      <div className="info">
        <h3 className="item__title">{position}</h3>
        <div className="company">
          <span className="company__name">{companyName}</span>
          <span> – </span>
          <span className="company__location">{companyCity}</span>
        </div>
        <p className="job__period">
          {start} – {end}
        </p>
        {/* Achievements first: recruiters scan only the top bullets of each role. */}
        <div className="achievements">
          <h4 className="achievements-title">{t('job.achievements')}</h4>
          <ul className="achievements-list">
            {achievements.map((item, index) => (
              <li key={index} className="list__item">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="responsibilities">
          <h4 className="responsibilities-title">
            {t('job.responsibilities')}
          </h4>
          <ul className="responsibilities-list">
            {responsibilities.map((item, index) => (
              <li key={index} className="list__item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="date" aria-hidden="true">
        <p className="end">{end}</p>
        <span className="date-delimiter">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="#fff"
          >
            <path d="M12 3l12 18h-24z" />
          </svg>
        </span>
        <p className="start">
          {fromMonth} <span>{fromYear}</span>
        </p>
      </div>
    </React.Fragment>
  );
}
