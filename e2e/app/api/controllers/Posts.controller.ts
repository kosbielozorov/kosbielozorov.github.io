import { API_URL } from '@constants';
import { BaseController } from '@controllers/Base.controller';
import { Post } from '@interfaces/post.interface';
import { APIResponse } from '@playwright/test';

/**
 * EXAMPLE — swap-out API example of this boilerplate, not a controller of your product.
 * Models `https://jsonplaceholder.typicode.com/posts`, a stable, free, no-auth demo API.
 * Example set: `specs/posts-api.md`, this file, its `ControllersManager` registration,
 * `post.schema.ts`, `post.interface.ts`, `tests/api/posts.test.ts`, `tests/api/posts.schema.test.ts`.
 * Replace or delete the whole set when adopting the boilerplate (`ai/project.md` → Examples);
 * do not extend this class for a real feature.
 */
export class PostsController extends BaseController {
  private readonly postsEndpoint = `${API_URL}/posts`;

  /**
   * GET /posts — lists every post.
   *
   * @returns {Promise<APIResponse>} The raw API response containing the list of posts.
   */
  async getPosts(): Promise<APIResponse> {
    return this.request.get(this.postsEndpoint);
  }

  /**
   * GET /posts/{id} — a single post by id (404 when it does not exist).
   *
   * @param {number} id - Post id to fetch.
   * @returns {Promise<APIResponse>} The raw API response.
   */
  async getPost(id: number): Promise<APIResponse> {
    return this.request.get(`${this.postsEndpoint}/${id}`);
  }

  /**
   * POST /posts — creates a post.
   *
   * @param {Pick<Post, 'title' | 'body' | 'userId'>} data - Post fields to create.
   * @returns {Promise<APIResponse>} The raw API response.
   */
  async createPost(
    data: Pick<Post, 'title' | 'body' | 'userId'>,
  ): Promise<APIResponse> {
    return this.request.post(this.postsEndpoint, { data });
  }

  /**
   * PUT /posts/{id} — replaces a post.
   *
   * @param {number} id - Post id to update.
   * @param {Partial<Post>} data - Post fields to update.
   * @returns {Promise<APIResponse>} The raw API response.
   */
  async updatePost(id: number, data: Partial<Post>): Promise<APIResponse> {
    return this.request.put(`${this.postsEndpoint}/${id}`, { data });
  }

  /**
   * DELETE /posts/{id} — deletes a post.
   *
   * @param {number} id - Post id to delete.
   * @returns {Promise<APIResponse>} The raw API response.
   */
  async deletePost(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.postsEndpoint}/${id}`);
  }
}
