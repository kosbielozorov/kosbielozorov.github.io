/**
 * EXAMPLE — swap-out API example of this boilerplate, not a test of your product.
 * Shows the full chain: plan `specs/posts-api.md` → controller `app/api/controllers/Posts.controller.ts`
 * (+ schema / interface) → this test. Replace or delete the whole example set when adopting the
 * boilerplate (`ai/project.md` → Examples).
 */
import { postSchema } from '@schemas/post.schema';
import { expect, test } from '@fixtures';

// Requirements: specs/posts-api.md (each test's `source` annotation). No Testomatio ids yet: `@unlinked`.
test.describe('Posts API — schema', () => {
  test(
    'GET /posts/{id} response matches the post schema @smoke',
    {
      tag: ['@unlinked', '@example', '@smoke'],
      annotation: [{ type: 'source', description: 'specs/posts-api.md#1.2' }],
    },
    async ({ controllersManager: { postsController } }) => {
      const response = await postsController.getPost(1);
      const body = await response.json();

      const { error } = postSchema.validate(body);
      expect(error).toBeUndefined();
    },
  );
});
