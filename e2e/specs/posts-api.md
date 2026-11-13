# Posts API

> **EXAMPLE — swap-out API example of this boilerplate, not a plan for your product.** Example set:
> this file, `app/api/controllers/Posts.controller.ts` (+ its `ControllersManager` registration),
> `app/api/schemas/post.schema.ts`, `app/api/interfaces/post.interface.ts`, `tests/api/posts.test.ts`
> and `tests/api/posts.schema.test.ts`. Replace or delete the whole set when adopting the
> boilerplate (`ai/project.md` → Examples).

## Scope

- In scope: `GET /posts`, `GET /posts/{id}`, `POST /posts`, `PUT /posts/{id}`, `DELETE /posts/{id}`
  against the public demo API `https://jsonplaceholder.typicode.com` — this repo's swap-out example
  for the `ControllersManager` / `BaseController` API pattern.
- Out of scope: real persistence (the demo API fakes writes — a `POST`/`PUT`/`DELETE` returns a
  plausible response but does not actually change server-side state); authentication (the demo API
  needs none).

## Assumptions

- The demo API is public, free, and stable enough for CI use; no API key or account is required.
- This spec — and the controller/tests it documents — is a **replaceable example**. When adopting
  this boilerplate for a real project, replace `Posts.controller.ts`, this file, and
  `tests/api/posts.*.ts` with your own API's controller/spec/tests.

## Risks

- The demo API may occasionally be slow or briefly unavailable (it's a shared public service) —
  treat sporadic failures there as infra flakiness, not a framework bug.

## Test data

- No fixtures/seed data required — `GET /posts/1` always exists on the demo API.
- `POST`/`PUT` payloads use `@faker-js/faker` for unique, parallel-safe titles/bodies.

## Environments

- `DEV_API_URL` (`app/constants/env.constants.ts`) — defaults to
  `https://jsonplaceholder.typicode.com` in `.env.example`.

## Scenarios

### 1. Posts API

#### 1.1 GET /posts returns a list of posts @smoke

**Preconditions:**

- None.

**Steps:**

1. Call `GET /posts` via `postsController.getPosts()`.

**Expected:**

- Response status is `200`.
- Body is a non-empty array.

**Page Objects / fixtures:**

- `controllersManager` / `postsController`

#### 1.2 GET /posts/{id} returns a single post @smoke

**Preconditions:**

- None.

**Steps:**

1. Call `GET /posts/1` via `postsController.getPost(1)`.

**Expected:**

- Response status is `200`.
- Body `id` equals `1`.
- Body matches `app/api/schemas/post.schema.ts` (see schema test).

**Page Objects / fixtures:**

- `controllersManager` / `postsController`

#### 1.3 GET /posts/{id} for a non-existent id returns 404 @critical

**Preconditions:**

- None.

**Steps:**

1. Call `GET /posts/999999`.

**Expected:**

- Response status is `404`.

**Page Objects / fixtures:**

- `controllersManager` / `postsController`

#### 1.4 POST /posts creates a post @critical

**Preconditions:**

- None.

**Steps:**

1. Call `POST /posts` with a Faker-generated `title`/`body`/`userId`.

**Expected:**

- Response status is `201`.
- Response body echoes the submitted `title`.

**Page Objects / fixtures:**

- `controllersManager` / `postsController`

#### 1.5 PUT /posts/{id} updates a post

**Preconditions:**

- None.

**Steps:**

1. Call `PUT /posts/1` with a new `title`.

**Expected:**

- Response status is `200`.
- Response body reflects the new `title`.

**Page Objects / fixtures:**

- `controllersManager` / `postsController`

#### 1.6 DELETE /posts/{id} deletes a post

**Preconditions:**

- None.

**Steps:**

1. Call `DELETE /posts/1`.

**Expected:**

- Response status is `200`.

**Page Objects / fixtures:**

- `controllersManager` / `postsController`
