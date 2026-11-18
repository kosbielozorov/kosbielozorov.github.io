import { BaseController } from './Base.controller';
import { PostsController } from './Posts.controller';

/**
 * API facade — register concrete controllers here, then use via the `controllersManager` fixture.
 *
 * @example
 * public resourceController = new ResourceController(this.request);
 */
export default class ControllersManager extends BaseController {
  /** EXAMPLE — remove with `Posts.controller.ts` when adopting the boilerplate (`ai/project.md` → Examples). */
  public postsController = new PostsController(this.request);
}
