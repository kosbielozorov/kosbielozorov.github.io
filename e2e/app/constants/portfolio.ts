/**
 * The site's own portfolio data (`../src/info/{en,uk}.js`), read-only. The home page's Experience
 * section shows the first two jobs of it (`specs/home-page.md` 1.2, Q-1), so the tests take their
 * titles and periods from the same data instead of copying them.
 */
// @ts-expect-error -- a plain JavaScript module of the site, without type declarations
import { portfolioData as en } from '../../../src/info/en.js';
// @ts-expect-error -- a plain JavaScript module of the site, without type declarations
import { portfolioData as uk } from '../../../src/info/uk.js';

/** One job as the site's data holds it. */
interface Job {
  position: string;
  fromMonth: string;
  fromYear: string;
  toMonth: string;
  toYear: string;
}

/** A job as the Experience section shows it. */
export interface ShownJob {
  title: string;
  period: string;
}

/** The period the way the site renders it: `<month year> – <month year>`, empty parts dropped. */
function shown(job: Job): ShownJob {
  const part = (month: string, year: string) =>
    [month, year].filter(Boolean).join(' ');
  return {
    title: job.position,
    period: `${part(job.fromMonth, job.fromYear)} – ${part(job.toMonth, job.toYear)}`,
  };
}

const jobsOf = (data: { experience: { jobs: Job[] } }): ShownJob[] =>
  data.experience.jobs.slice(0, 2).map(shown);

/** The two most recent jobs, per language — what the Experience section must show. */
export const RECENT_JOBS: Readonly<Record<'en' | 'uk', readonly ShownJob[]>> = {
  en: jobsOf(en as { experience: { jobs: Job[] } }),
  uk: jobsOf(uk as { experience: { jobs: Job[] } }),
};
