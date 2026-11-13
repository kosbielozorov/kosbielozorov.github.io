import Joi from 'joi';

/**
 * EXAMPLE — part of the swap-out API example set (`Posts.controller.ts`), not your product's contract.
 * Response contract for a single `jsonplaceholder.typicode.com` `/posts` resource.
 * Replace or delete with the whole set (`ai/project.md` → Examples).
 */
export const postSchema = Joi.object({
  userId: Joi.number().integer().required(),
  id: Joi.number().integer().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});
