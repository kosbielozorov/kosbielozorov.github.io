---
name: generate-controller-skeleton
description: Generates a Playwright API controller skeleton under app/api/controllers following the project contract — BaseController extension, ControllersManager registration, and when a new fixture is actually justified. Use when creating a new API controller, adding a method to an existing one, or when the user asks to add API coverage for an endpoint and it's unclear which controller/fixture to use.
---

# Generate API controller skeleton

## Rules (must follow)

- Controllers: `app/api/controllers/*.controller.ts` — **must extend** `BaseController`
  (`app/api/controllers/Base.controller.ts`)
- Register every new controller as a public field on `ControllersManager`
  (`app/api/controllers/ControllersManager.ts`) — never a new fixture just for a controller.
- Tests reach controllers only through the `controllersManager` fixture; import fixtures from
  `@fixtures` (do not modify tests here unless asked).
- A concrete `*.controller.ts` imports `BaseController` via `@controllers/Base.controller`, **not**
  a relative `./Base.controller` — the file may later move into a feature subfolder.
- Response/body TS types: `app/api/interfaces/<name>.interface.ts`, imported via `@interfaces/*`.
  Add one when the response shape is non-trivial or reused elsewhere; keep a one-off single-field
  response inline on the controller method instead (YAGNI — don't create an interface file for
  every trivial response).
- Follow `ai/instructions/02-architecture.md` → **Framework contract** (imports, JSDoc, healing).
- Read the project binding first: `ai/project.md` (real paths, base classes, fixtures).

## Check existing code first

- Run `npm run catalog:generate` (fast, deterministic — regenerates from source, never stale by
  the time you read it) and scan `specs/framework-catalog.md`'s **API Controllers** section: class
  summary + public method list per controller, without opening every candidate file first.
- Search `app/api/controllers/` for a controller already covering this endpoint or a very similar
  request shape — extend it with a new method rather than creating a new file, unless the target
  is a genuinely different resource/domain.
- Check `app/constants/` for an existing base URL / endpoint constant before inventing a new one.

**Exists → use. Similar → extend/compose. Only create when nothing covers the need.**

## Files to create

- Controller: `app/api/controllers/<Name>.controller.ts` (+ register on `ControllersManager`)
- Interface (only if the response shape is non-trivial or reused):
  `app/api/interfaces/<name>.interface.ts`

## Default pattern

```ts
// app/api/controllers/resource.controller.ts
import { APIResponse } from '@playwright/test';
import { API_URL } from '@constants';
import { BaseController } from '@controllers/Base.controller';

/** One-line class summary — what this controller talks to and why it exists. */
export class ResourceController extends BaseController {
  private readonly resourceEndpoint = `${API_URL}/resource`;

  /** GET /resource — lists every resource. */
  async getResources(): Promise<APIResponse> {
    return this.request.get(this.resourceEndpoint);
  }

  /** POST /resource — creates a resource. */
  async createResource(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post(this.resourceEndpoint, { data });
  }
}
```

```ts
// app/api/controllers/ControllersManager.ts
export default class ControllersManager extends BaseController {
  public resourceController = new ResourceController(this.request);
}
```

## Auth header (when the API needs it)

`BaseController` provides `getReq`/`postReq`/`putReq`/`deleteReq` — same shape as
`this.request.<verb>`, plus a `protected authHeaders(): Record<string, string>` hook that every
one of them merges into its headers. It defaults to `{}` (no auth). For a controller whose API
actually requires auth, override the hook in that controller:

```ts
protected authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${API_TOKEN}` }; // or an API-key header, Basic auth, etc.
}
```

To exercise an auth-failure case, pass a conflicting header via `options.headers` on the call —
it overrides `authHeaders()`:

```ts
await this.getReq(this.resourceEndpoint, { headers: { Authorization: 'Bearer invalid' } });
```

Use `getReq`/`postReq`/`putReq`/`deleteReq` **only when the target API actually requires** auth
headers — the demo `PostsController` calls `this.request.get/post/put/delete` directly because its
demo API needs no auth at all and never overrides `authHeaders()`. Don't switch an unauthenticated
controller to the `*Req` wrappers just for consistency.

## JSON vs. raw response

- **Default (JSON envelope):** return the raw `APIResponse` from `this.request.<verb>(...)` and let
  the caller (test, or an assertion helper on `BaseController`) decide whether to `.json()` it —
  matches every method above and the existing `BaseController` assertion helpers.
- **Raw / binary responses** (file download, non-JSON body): still return the raw `APIResponse` —
  never force `.json()` inside the controller method when the caller may need the raw response
  (status, headers, buffer).

## Adding a new fixture (rare)

A new fixture is only justified when a controller needs its own `APIRequestContext` (e.g. a
different auth scheme than the rest of the suite). Default to composing the new controller on the
existing `ControllersManager` — do not add a fixture just to expose one controller.

## Rules recap

- JSDoc on every public controller method — short description of what the request does; skill
  `jsdoc` defines the block format.
- Atomic methods: one method = one request (see `01-fundamental-principles.md`).
- No hardcoded endpoint path duplicated across controllers — declare it once as a class field
  (`private readonly xEndpoint = ...`) built from the shared `API_URL` constant.
