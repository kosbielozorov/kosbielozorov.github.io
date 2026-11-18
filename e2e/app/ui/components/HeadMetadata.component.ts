import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/** The JSON-LD `Person` fields the tests check (`specs/head-metadata.md` 1.2). */
export interface ExpectedPerson {
  name: string;
  jobTitle: string;
  email: string;
  telephone: string;
  url: string;
  image: string;
  sameAs: readonly string[];
  /** The `name` of `worksFor`. */
  worksFor: string;
}

const IMAGE = /^image\//;
const JSON_TYPE = /json/;

/** `og:*` / `profile:*` keys are `property` tags; the others (`description`, `twitter:*`) `name` tags. */
const attributeOf = (key: string): 'property' | 'name' =>
  /^(og|profile):/.test(key) ? 'property' : 'name';

/**
 * The document head as search engines and link previews read it: `<meta>` / `<link>` tags, the
 * JSON-LD `Person`, the raw HTML served before JavaScript, the icons and the web manifest. The head
 * has no roles, so its tags are found by their attributes. Requirement: `specs/head-metadata.md`
 * (zone Z-5).
 */
export class HeadMetadata extends Component {
  private readonly jsonLd: Locator = this.page.locator(
    'script[type="application/ld+json"]',
  );
  /** The icon and manifest links, with the type each must be served as. */
  private readonly iconLinks = [
    {
      what: '16 px favicon',
      link: this.page.locator('head link[rel="icon"][sizes="16x16"]'),
      type: IMAGE,
    },
    {
      what: '32 px favicon',
      link: this.page.locator('head link[rel="icon"][sizes="32x32"]'),
      type: IMAGE,
    },
    {
      what: 'Apple touch icon',
      link: this.page.locator('head link[rel="apple-touch-icon"]'),
      type: IMAGE,
    },
    {
      what: 'Manifest',
      link: this.page.locator('head link[rel="manifest"]'),
      type: JSON_TYPE,
    },
  ] as const;

  /**
   * Asserts the document has a title.
   *
   * @param {string} [message='Document head should have a title'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the title is not empty.
   */
  async expectLoaded(
    message = 'Document head should have a title',
  ): Promise<void> {
    await expect(this.page, message).toHaveTitle(/\S/);
  }

  /**
   * Asserts a meta tag appears exactly once with this value.
   *
   * @param {string} key - e.g. `og:title`, `description`.
   * @param {string} value - The exact expected `content`.
   * @returns {Promise<void>} Resolves once the single tag has that content.
   */
  async expectTag(key: string, value: string): Promise<void> {
    const tag = this.meta(key);
    await expect(tag, `Meta "${key}" exactly once`).toHaveCount(1);
    await expect(tag, `Meta "${key}"`).toHaveAttribute('content', value);
  }

  /**
   * Asserts no meta tag starts with any of these prefixes — e.g. no `og:*` or `twitter:*` at all.
   *
   * @param {readonly string[]} prefixes - Key prefixes, e.g. `og:`, `twitter:`.
   * @returns {Promise<void>} Resolves once no tag with such a key exists.
   */
  async expectNoTagsWithPrefixes(prefixes: readonly string[]): Promise<void> {
    for (const prefix of prefixes)
      await expect(
        this.page.locator(`head meta[${attributeOf(prefix)}^="${prefix}"]`),
        `No meta "${prefix}*"`,
      ).toHaveCount(0);
  }

  /**
   * Asserts a head link appears exactly once with this `href`.
   *
   * @param {string} rel - e.g. `canonical`.
   * @param {string} href - The exact expected `href`.
   * @returns {Promise<void>} Resolves once the single link has that `href`.
   */
  async expectLink(rel: string, href: string): Promise<void> {
    const link = this.link(rel);
    await expect(link, `Link "${rel}" exactly once`).toHaveCount(1);
    await expect(link, `Link "${rel}"`).toHaveAttribute('href', href);
  }

  /**
   * Asserts there is no head link with this `rel`.
   *
   * @param {string} rel - e.g. `canonical`.
   * @returns {Promise<void>} Resolves once no such link exists.
   */
  async expectNoLink(rel: string): Promise<void> {
    await expect(this.link(rel), `No link "${rel}"`).toHaveCount(0);
  }

  /**
   * Asserts an image tag (`og:image`, `twitter:image`) appears once with an absolute URL on the
   * site, and that the site serves an image at that path.
   *
   * @param {string} key - `og:image` or `twitter:image`.
   * @param {string} site - The site's origin, e.g. `https://kosbielozorov.github.io`.
   * @returns {Promise<void>} Resolves once the URL is absolute on the site and answers with an image.
   */
  async expectImageTag(key: string, site: string): Promise<void> {
    const tag = this.meta(key);
    await expect(tag, `Meta "${key}" exactly once`).toHaveCount(1);
    await this.expectServedImage(
      (await tag.getAttribute('content')) ?? '',
      site,
      key,
    );
  }

  /**
   * Asserts the page has one JSON-LD block, a `Person` carrying these fields.
   *
   * @param {ExpectedPerson} expected - The fields and their values.
   * @returns {Promise<void>} Resolves once the `Person` matches every field.
   */
  async expectPerson(expected: ExpectedPerson): Promise<void> {
    await expect(this.jsonLd, 'One JSON-LD block').toHaveCount(1);
    const person = JSON.parse(
      (await this.jsonLd.textContent()) ?? '{}',
    ) as Record<string, unknown>;
    const { worksFor, ...fields } = expected;
    expect(person['@type'], 'JSON-LD type').toBe('Person');
    expect(person, 'JSON-LD Person').toMatchObject({
      ...fields,
      sameAs: [...expected.sameAs],
      worksFor: { name: worksFor },
    });
  }

  /**
   * Requests a path as plain HTML (no JavaScript runs) and asserts its head has these meta tags with
   * a non-empty content — what a link-preview bot reads.
   *
   * @param {string} path - e.g. `/my-resume`.
   * @param {readonly string[]} keys - Tag keys, e.g. `og:title`.
   * @returns {Promise<void>} Resolves once every tag is in the served HTML.
   */
  async expectStaticTags(path: string, keys: readonly string[]): Promise<void> {
    const contents = await this.staticTags(path, keys);
    const missing = keys.filter(key => !contents[key]?.trim());
    expect(missing, `Tags missing from the HTML of ${path}`).toEqual([]);
  }

  /**
   * Requests a path as plain HTML and asserts its static `og:image` is an absolute URL on the site
   * that the site serves as an image.
   *
   * @param {string} path - e.g. `/`.
   * @param {string} site - The site's origin, e.g. `https://kosbielozorov.github.io`.
   * @returns {Promise<void>} Resolves once the static image URL is absolute and served as an image.
   */
  async expectStaticImageTag(path: string, site: string): Promise<void> {
    const contents = await this.staticTags(path, ['og:image']);
    await this.expectServedImage(
      contents['og:image'] ?? '',
      site,
      `static og:image of ${path}`,
    );
  }

  /**
   * Requests `/site.webmanifest` and asserts it has a non-empty `name` and `short_name`.
   *
   * @returns {Promise<void>} Resolves once both are present.
   */
  async expectManifestNamed(): Promise<void> {
    const response = await this.page.request.get('/site.webmanifest');
    expect(response.ok(), 'Web manifest should be served').toBe(true);
    const manifest = (await response.json()) as {
      name?: string;
      short_name?: string;
    };
    expect(manifest.name?.trim(), 'Manifest name').toBeTruthy();
    expect(manifest.short_name?.trim(), 'Manifest short_name').toBeTruthy();
  }

  /**
   * Asserts the head has the viewport, the 16 and 32 px favicons, the Apple touch icon and the
   * manifest link — each once, each leading to a file the site serves (images; the manifest as JSON).
   *
   * @returns {Promise<void>} Resolves once each is present once and served.
   */
  async expectIcons(): Promise<void> {
    await this.expectTag('viewport', 'width=device-width, initial-scale=1.0');
    for (const { what, link, type } of this.iconLinks) {
      await expect(link, what).toHaveCount(1);
      const href = (await link.getAttribute('href')) ?? '';
      const response = await this.page.request.get(href);
      expect(response.ok(), `${what} (${href}) should be served`).toBe(true);
      expect(
        response.headers()['content-type'] ?? '',
        `${what} (${href}) type`,
      ).toMatch(type);
    }
  }

  /** A meta tag by key. */
  private meta(key: string): Locator {
    return this.page.locator(`head meta[${attributeOf(key)}="${key}"]`);
  }

  /** A head link by `rel`. */
  private link(rel: string): Locator {
    return this.page.locator(`head link[rel="${rel}"]`);
  }

  /** The meta tags of a path's raw HTML (no JavaScript), key → content. */
  private async staticTags(
    path: string,
    keys: readonly string[],
  ): Promise<Record<string, string | undefined>> {
    const response = await this.page.request.get(path);
    expect(response.ok(), `${path} should be served`).toBe(true);
    const html = await response.text();
    return this.page.evaluate(
      ([source, wanted]) => {
        const doc = new DOMParser().parseFromString(source, 'text/html');
        return Object.fromEntries(
          wanted.map(key => {
            const attribute = /^(og|profile):/.test(key) ? 'property' : 'name';
            const tag = doc.head.querySelector(`meta[${attribute}="${key}"]`);
            return [key, tag?.getAttribute('content') ?? undefined];
          }),
        );
      },
      [html, [...keys]] as const,
    );
  }

  /** Asserts a URL is absolute on the site and the site serves an image at its path. */
  private async expectServedImage(
    url: string,
    site: string,
    what: string,
  ): Promise<void> {
    expect(
      url.startsWith(`${site}/`),
      `${what} should be an absolute ${site} URL, got "${url}"`,
    ).toBe(true);
    const response = await this.page.request.get(url.slice(site.length));
    expect(response.ok(), `${what} image should be served`).toBe(true);
    expect(
      response.headers()['content-type'] ?? '',
      `${what} should be an image`,
    ).toMatch(IMAGE);
  }
}
