import test, { APIRequestContext, APIResponse, expect } from '@playwright/test';

export abstract class BaseController {
  request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Auth headers merged into every `getReq`/`postReq`/`putReq`/`deleteReq` call. Defaults to
   * none — override in a controller for a real product API to inject its actual auth scheme,
   * e.g.:
   * ```ts
   * protected authHeaders(): Record<string, string> {
   *   return { Authorization: `Bearer ${API_TOKEN}` };
   * }
   * ```
   * The demo `PostsController` targets an unauthenticated API and calls
   * `this.request.<verb>()` directly instead of these wrappers.
   */
  protected authHeaders(): Record<string, string> {
    return {};
  }

  /**
   * Sends a `GET` request with `authHeaders()` applied.
   *
   * @param {string} endpoint - The full endpoint URL.
   * @param {object} [options] - Optional configuration:
   *   - headers: Additional headers to merge (override `authHeaders()` on conflict).
   *   - params: Query parameters as key/value pairs (string, number, or boolean values).
   * @returns {Promise<APIResponse>} The raw Playwright APIResponse.
   *
   * @example
   * const response = await controller.getReq('/posts', { headers: { Authorization: 'Bearer invalid' } });
   */
  async getReq(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
    },
  ): Promise<APIResponse> {
    return this.request.get(endpoint, {
      headers: { ...this.authHeaders(), ...options?.headers },
      params: options?.params,
    });
  }

  /**
   * Sends a `POST` request with `authHeaders()` applied.
   *
   * @param {string} endpoint - The full endpoint URL.
   * @param {object} data - The request payload to send in the body.
   * @param {object} [options] - Optional configuration:
   *   - headers: Additional headers to merge (override `authHeaders()` on conflict).
   * @returns {Promise<APIResponse>} The raw Playwright APIResponse.
   *
   * @example
   * const response = await controller.postReq('/posts', { foo: 'bar' });
   */
  async postReq(
    endpoint: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.post(endpoint, {
      headers: { ...this.authHeaders(), ...options?.headers },
      data,
    });
  }

  /**
   * Sends a `PUT` request with `authHeaders()` applied.
   *
   * @param {string} endpoint - The full endpoint URL.
   * @param {object} data - The request payload to send in the body.
   * @param {object} [options] - Optional configuration:
   *   - headers: Additional headers to merge (override `authHeaders()` on conflict).
   * @returns {Promise<APIResponse>} The raw Playwright APIResponse.
   *
   * @example
   * const response = await controller.putReq('/posts/1', { foo: 'bar' });
   */
  async putReq(
    endpoint: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.put(endpoint, {
      headers: { ...this.authHeaders(), ...options?.headers },
      data,
    });
  }

  /**
   * Sends a `DELETE` request with `authHeaders()` applied.
   *
   * @param {string} endpoint - The full endpoint URL.
   * @param {object} [options] - Optional configuration:
   *   - headers: Additional headers to merge (override `authHeaders()` on conflict).
   * @returns {Promise<APIResponse>} The raw Playwright APIResponse.
   *
   * @example
   * const response = await controller.deleteReq('/posts/1');
   */
  async deleteReq(
    endpoint: string,
    options?: { headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.delete(endpoint, {
      headers: { ...this.authHeaders(), ...options?.headers },
    });
  }

  /**
   * Asserts the response status code matches the expected value.
   *
   * @param {APIResponse} response - The response to check.
   * @param {number} statusCode - Expected HTTP status code.
   * @returns {Promise<void>} Resolves once the assertion has run.
   *
   * @remarks
   *  - Uses `expect.soft()`, so a mismatch is recorded without stopping the test.
   *
   * @example
   * await controllersManager.expectResponseStatusCode(response, 200);
   */
  async expectResponseStatusCode(response: APIResponse, statusCode: number) {
    await test.step(`Expect: response status code should be: ${statusCode}`, async () => {
      expect.soft(response.status()).toBe(statusCode);
    });
  }

  /**
   * Asserts the response body's `messages` array matches the expected messages, order-independent.
   *
   * @param {APIResponse} response - The response to check.
   * @param {string[]} expectedMessages - Expected error messages.
   * @returns {Promise<void>} Resolves once the assertion has run.
   */
  async expectResponseErrorMessages(
    response: APIResponse,
    expectedMessages: string[],
  ) {
    await test.step('Expect: response messages should match expected messages', async () => {
      const responseBody = await response.json();

      expect(
        [...responseBody.messages].sort((a, b) => a.localeCompare(b)),
        'Expect actual error messages should be equal to expected error messages',
      ).toEqual([...expectedMessages].sort((a, b) => a.localeCompare(b)));
    });
  }

  /**
   * Asserts the response body's single `message` field equals the expected message.
   *
   * @param {APIResponse} response - The response to check.
   * @param {string} expectedMessages - Expected error message.
   * @returns {Promise<void>} Resolves once the assertion has run.
   */
  async expectResponseErrorMessage(
    response: APIResponse,
    expectedMessages: string,
  ) {
    await test.step('Expect: response messages should match expected messages', async () => {
      const responseBody = await response.json();

      expect(
        responseBody.message,
        'Expect actual error message should be equal to expected error message',
      ).toEqual(expectedMessages);
    });
  }

  /**
   * Characterization scaffolding only (`tests/characterization/`): pins the response's status and
   * the **shape** of its JSON body (keys and value types, the first item of each array) — never
   * the values, so ids, dates and other dynamic fields do not break it. Not an oracle — a red
   * result means "behaviour changed", and only a human updates the snapshot
   * (`ai/instructions/02-architecture.md` → **Characterization scaffolding**).
   *
   * @param {APIResponse} response - The response to pin.
   * @param {string} name - Snapshot name, unique within the test file (stored as `<name>.shape.json`).
   * @returns {Promise<void>} Resolves once status and body shape match the stored snapshot.
   */
  async expectResponseShape(response: APIResponse, name: string) {
    await test.step(`Expect: response shape should match snapshot "${name}"`, async () => {
      const text = await response.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        // not JSON — its shape is "string"
      }
      const shape = { status: response.status(), body: shapeOf(body) };
      expect(JSON.stringify(shape, null, 2)).toMatchSnapshot(
        `${name}.shape.json`,
      );
    });
  }
}

/** Keys and value types of a JSON value; arrays are represented by their first item. */
function shapeOf(value: unknown): unknown {
  if (value === null) return 'null';
  if (Array.isArray(value))
    return value.length ? [shapeOf(value[0])] : ['empty'];
  if (typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, shapeOf((value as Record<string, unknown>)[key])]),
    );
  return typeof value;
}
