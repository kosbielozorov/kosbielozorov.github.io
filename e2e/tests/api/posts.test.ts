/**
 * EXAMPLE — swap-out API example of this boilerplate, not a test of your product.
 * Shows the full chain: plan `specs/posts-api.md` → controller `app/api/controllers/Posts.controller.ts`
 * (+ schema / interface) → this test. Replace or delete the whole example set when adopting the
 * boilerplate (`ai/project.md` → Examples).
 */
import { faker } from '@faker-js/faker';
import { expect, test } from '@fixtures';

// Requirements: specs/posts-api.md (each test's `source` annotation). No Testomatio ids yet: `@unlinked`.
test.describe('Posts API (jsonplaceholder.typicode.com)', () => {
  test(
    'GET /posts returns a list of posts @smoke',
    {
      tag: ['@unlinked', '@example', '@smoke'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.1' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.postsController.getPosts();
      const body = await response.json();

      await controllersManager.expectResponseStatusCode(response, 200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    },
  );

  test(
    'GET /posts/{id} returns a single post @smoke',
    {
      tag: ['@unlinked', '@example', '@smoke'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.2' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.postsController.getPost(1);
      const body = await response.json();

      await controllersManager.expectResponseStatusCode(response, 200);
      expect(body.id).toBe(1);
    },
  );

  test(
    'GET /posts/{id} for a non-existent id returns 404 @critical',
    {
      tag: ['@unlinked', '@example', '@critical'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.3' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.postsController.getPost(999999);

      await controllersManager.expectResponseStatusCode(response, 404);
    },
  );

  test(
    'POST /posts creates a post @critical',
    {
      tag: ['@unlinked', '@example', '@critical'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.4' }],
    },
    async ({ controllersManager }) => {
      const payload = {
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        userId: 1,
      };
      const response =
        await controllersManager.postsController.createPost(payload);
      const body = await response.json();

      await controllersManager.expectResponseStatusCode(response, 201);
      expect(body.title).toBe(payload.title);
    },
  );

  test(
    'PUT /posts/{id} updates a post',
    {
      tag: ['@unlinked', '@example'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.5' }],
    },
    async ({ controllersManager }) => {
      const updatedTitle = faker.lorem.sentence();
      const response = await controllersManager.postsController.updatePost(1, {
        title: updatedTitle,
      });
      const body = await response.json();

      await controllersManager.expectResponseStatusCode(response, 200);
      expect(body.title).toBe(updatedTitle);
    },
  );

  test(
    'DELETE /posts/{id} deletes a post',
    {
      tag: ['@unlinked', '@example'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.6' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.postsController.deletePost(1);

      await controllersManager.expectResponseStatusCode(response, 200);
    },
  );
});
