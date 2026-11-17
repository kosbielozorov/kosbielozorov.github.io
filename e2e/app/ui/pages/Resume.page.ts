import { expect, type Locator } from '@playwright/test';
import { SiteMenu } from '@components/SiteMenu.component';
import { BasePage } from '@pages/BasePage';

/** Name and position of the resume profile, in the page's language. */
export interface ResumeProfile {
  name: string;
  position: string;
}

/** Contact links of the resume profile, as `href` values. */
export interface ResumeContactLinks {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  telegram: string;
}

/**
 * What each contact link shows — the same in both languages (an address, not a translated word).
 * A label, not the `href`, picks the link, so the `href` check can catch a link pointing elsewhere.
 */
const CONTACT_LABELS: Record<keyof ResumeContactLinks, RegExp> = {
  email: /@/,
  phone: /^\+?[\d\s()-]+$/,
  linkedin: /linkedin\.com/,
  github: /github\.com/,
  telegram: /t\.me\//,
};

/**
 * Resume page (`/my-resume`): profile, contacts, sections, the PDF download and "Back to home".
 * Requirement: `specs/resume-page.md` (confirmed observations, zone Z-1 of `specs/app-map.md`).
 */
export class ResumePage extends BasePage {
  public readonly pagePath = '/my-resume';

  /** The header menu and the drawer. */
  public readonly menu = new SiteMenu(this.page);

  private readonly main: Locator = this.page.getByRole('main');
  private readonly name: Locator = this.main.getByRole('heading', {
    level: 1,
  });
  /** The position has no role of its own; it is marked up as schema.org `jobTitle`. */
  private readonly position: Locator = this.main.locator(
    '[itemprop="jobTitle"]',
  );
  private readonly photo: Locator = this.main.getByRole('img').first();
  private readonly sections: Locator = this.main.getByRole('heading', {
    level: 2,
  });
  private readonly contacts: Locator = this.main.locator('address');
  /** The download link's text is translated; its `download` attribute is not. */
  private readonly downloadLink: Locator = this.main.locator('a[download]');
  private readonly backToHomeLink: Locator = this.main.locator('#back-to-home');
  /**
   * The header menu's switcher. The banner also holds the drawer's switcher (first in the DOM,
   * off screen on desktop), so the menu's is the last one.
   */
  private readonly languageSwitcher: Locator = this.page
    .getByRole('banner')
    .getByRole('group', { name: 'Language' })
    .last();

  /**
   * Asserts the resume page has finished loading.
   *
   * @param {string} [message='Resume page should be loaded'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the name heading is visible.
   */
  async expectLoaded(message = 'Resume page should be loaded'): Promise<void> {
    await expect(this.name, message).toBeVisible();
  }

  /**
   * Asserts the profile: the name is the page's only `h1` and reads `profile.name`, the position
   * reads `profile.position`, and the photo is shown with a text alternative.
   *
   * @param {ResumeProfile} profile - Expected name and position, in the page's language.
   * @returns {Promise<void>} Resolves once all profile checks pass.
   */
  async expectProfileShown(profile: ResumeProfile): Promise<void> {
    await expect(
      this.page.getByRole('heading', { level: 1 }),
      'The name should be the only h1',
    ).toHaveCount(1);
    await expect(this.name, 'Name').toHaveText(profile.name);
    await expect(this.position, 'Position').toHaveText(profile.position);
    await expect(this.photo, 'Photo').toBeVisible();
    await expect(this.photo, 'Photo text alternative').toHaveAttribute(
      'alt',
      /\S/,
    );
  }

  /**
   * Asserts the title `<name> – <position> | <suffix>`.
   *
   * @param {ResumeProfile & { suffix: string }} title - Name, position and the translated page name
   *   after `|` (e.g. `My resume`).
   * @returns {Promise<void>} Resolves once the page title equals the filled-in template.
   */
  async expectResumeTitle(
    title: ResumeProfile & { suffix: string },
  ): Promise<void> {
    await expect(this.page, 'Resume title').toHaveTitle(
      `${title.name} – ${title.position} | ${title.suffix}`,
    );
  }

  /**
   * Asserts the section headings, in order.
   *
   * @param {readonly string[]} names - Expected `h2` texts of the page, in order.
   * @returns {Promise<void>} Resolves once the headings match `names` exactly.
   */
  async expectSections(names: readonly string[]): Promise<void> {
    await expect(this.sections, 'Resume sections').toHaveText([...names]);
  }

  /**
   * Asserts each contact link of the profile points to the given address. Each link is found by
   * what it shows (an e-mail, a phone number, the service's address), so two swapped links fail.
   *
   * @param {ResumeContactLinks} links - Expected `href` per contact.
   * @returns {Promise<void>} Resolves once every contact's own link has its `href`.
   */
  async expectContactLinks(links: ResumeContactLinks): Promise<void> {
    for (const [contact, href] of Object.entries(links) as [
      keyof ResumeContactLinks,
      string,
    ][])
      await expect(
        this.contacts.getByRole('link', { name: CONTACT_LABELS[contact] }),
        `${contact} link`,
      ).toHaveAttribute('href', href);
  }

  /**
   * Asserts the download button links to `fileName` (its `href`, not only its `download` name),
   * clicks it and asserts the downloaded file name, then that the server serves the file as a PDF.
   *
   * @param {string} fileName - Expected file name of the download.
   * @returns {Promise<void>} Resolves once the download and the served file are checked.
   */
  async expectResumeDownload(fileName: string): Promise<void> {
    await this.expectResumeLink(fileName);
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadLink.click(),
    ]);
    expect(download.suggestedFilename(), 'Downloaded file name').toBe(fileName);
    const response = await this.page.request.get(await this.resumeHref());
    await expect(response, 'The resume PDF should be served').toBeOK();
    expect(response.headers()['content-type'], 'Resume content type').toBe(
      'application/pdf',
    );
  }

  /**
   * Asserts the download button links to the given resume file.
   *
   * @param {string} fileName - Expected file name at the end of the link.
   * @returns {Promise<void>} Resolves once the link's `href` and `download` attributes match.
   */
  async expectResumeLink(fileName: string): Promise<void> {
    await expect(this.downloadLink, 'Resume link').toHaveAttribute(
      'href',
      // The spec names the file, not its folder: any path ending in `/<fileName>`.
      new RegExp(`/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
    );
    await expect(this.downloadLink, 'Resume file name').toHaveAttribute(
      'download',
      fileName,
    );
  }

  /**
   * Fetches the resume PDF the download button currently links to.
   *
   * @returns {Promise<Buffer>} The file's bytes.
   */
  async resumePdf(): Promise<Buffer> {
    const response = await this.page.request.get(await this.resumeHref());
    await expect(response, 'The resume PDF should be served').toBeOK();
    return response.body();
  }

  /**
   * Asserts the sharing metadata of the head.
   *
   * @param {{ canonical: string, ogUrl: string, ogType: string }} metadata - Expected values.
   * @returns {Promise<void>} Resolves once `canonical`, `og:url` and `og:type` match.
   */
  async expectShareMetadata(metadata: {
    canonical: string;
    ogUrl: string;
    ogType: string;
  }): Promise<void> {
    await expect(
      this.page.locator('link[rel="canonical"]'),
      'canonical',
    ).toHaveAttribute('href', metadata.canonical);
    await expect(
      this.page.locator('meta[property="og:url"]'),
      'og:url',
    ).toHaveAttribute('content', metadata.ogUrl);
    await expect(
      this.page.locator('meta[property="og:type"]'),
      'og:type',
    ).toHaveAttribute('content', metadata.ogType);
  }

  /**
   * Asserts the head carries one JSON-LD block describing a schema.org `Person`.
   *
   * @returns {Promise<void>} Resolves once the block parses and its `@type` is `Person`.
   */
  async expectPersonStructuredData(): Promise<void> {
    const script = this.page.locator('script[type="application/ld+json"]');
    await expect(script, 'JSON-LD block').toHaveCount(1);
    const data = JSON.parse((await script.textContent()) ?? '{}') as {
      '@type'?: string;
    };
    expect(data['@type'], 'JSON-LD type').toBe('Person');
  }

  /**
   * Asserts the head has exactly one `meta description`, and that it is the page's own: it starts
   * with the full name of the page's language.
   *
   * @param {string} name - The full name in the page's language.
   * @returns {Promise<void>} Resolves once one description tag is found and starts with `<name> – `.
   */
  async expectSingleMetaDescription(name: string): Promise<void> {
    const description = this.page.locator('meta[name="description"]');
    await expect(description, 'meta description tags').toHaveCount(1);
    expect(
      ((await description.getAttribute('content')) ?? '').startsWith(
        `${name} – `,
      ),
      `The description should be the page's own, starting with "${name} – "`,
    ).toBe(true);
  }

  /**
   * Switches the site language with the header's switcher.
   *
   * @param {'EN' | 'UA'} language - The switcher button to click.
   * @returns {Promise<void>} Resolves once the button is clicked.
   */
  async switchLanguage(language: 'EN' | 'UA'): Promise<void> {
    await this.languageSwitcher
      .getByRole('button', { name: language, exact: true })
      .click();
  }

  /**
   * Asserts the language stored for the next visit.
   *
   * @param {'en' | 'uk'} language - Expected value of `localStorage.i18nextLng`.
   * @returns {Promise<void>} Resolves once the stored value equals `language`.
   */
  async expectStoredLanguage(language: 'en' | 'uk'): Promise<void> {
    await expect
      .poll(
        () => this.page.evaluate(() => localStorage.getItem('i18nextLng')),
        { message: 'Stored language' },
      )
      .toBe(language);
  }

  /**
   * Asserts the name heading's text.
   *
   * @param {string} name - Full name in the page's language, e.g. `Kostiantyn Bielozorov`.
   * @returns {Promise<void>} Resolves once the page's `h1` reads `name`.
   */
  async expectName(name: string): Promise<void> {
    await expect(this.name, 'Resume name').toHaveText(name);
  }

  /**
   * Clicks "Back to home".
   *
   * @returns {Promise<void>} Resolves once the link is clicked.
   */
  async backToHome(): Promise<void> {
    await this.backToHomeLink.click();
  }

  /** The `href` of the download button, which every resume check reads. */
  private async resumeHref(): Promise<string> {
    await expect(
      this.downloadLink,
      'The download button should link to a file',
    ).toHaveAttribute('href', /\S/);
    return (await this.downloadLink.getAttribute('href')) ?? '';
  }
}
