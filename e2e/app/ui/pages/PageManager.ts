import { AnyPage } from './Any.page';
import { HomePage } from './Home.page';
import { NotFoundPage } from './NotFound.page';
import { PageHolder } from './PageHolder';
import { ResumePage } from './Resume.page';

/**
 * UI facade — register concrete pages here, then use via the `pageManager` fixture.
 *
 * @example
 * public homePage = new HomePage(this.page);
 */
export default class PageManager extends PageHolder {
  public homePage = new HomePage(this.page);
  public resumePage = new ResumePage(this.page);
  public notFoundPage = new NotFoundPage(this.page);
  /** Characterization scaffolding only — page-level snapshots of a legacy zone with no Page Objects yet. */
  public anyPage = new AnyPage(this.page);
}
