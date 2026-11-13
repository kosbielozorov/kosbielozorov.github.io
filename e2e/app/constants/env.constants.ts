import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Joi from 'joi';

/**
 * Package root resolved from this module, not from `process.cwd()`.
 * The package may be run from a product repo root, so cwd is not reliable.
 */
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

dotenv.config({ path: join(PACKAGE_ROOT, '.env'), quiet: true });

const boolean = Joi.boolean().truthy('true', '1').falsy('false', '0', '');
const artifactMode = Joi.string().valid(
  'on',
  'off',
  'retain-on-failure',
  'on-first-retry',
);

/**
 * Every runner setting has a default. An unset variable must never silently
 * become `NaN` — `workers: NaN` makes Playwright run zero tests and still exit 0.
 */
const schema = Joi.object({
  // Application under test
  DEV_BASE_APP_URL: Joi.string().uri().required(),
  DEV_API_URL: Joi.string().uri().allow('').default(''),

  // Runner
  CI: boolean.default(false),
  FULLY_PARALLEL: boolean.default(true),
  WORKERS: Joi.number().integer().min(1).default(4),
  RETRIES: Joi.number().integer().min(0).default(1),
  REPEAT: Joi.number().integer().min(1).default(1),
  TEST_TIMEOUT: Joi.number().integer().min(1_000).default(60_000),
  EXPECT_TIMEOUT: Joi.number().integer().min(1_000).default(5_000),
  TRACE_VALUE: artifactMode.default('retain-on-failure'),
  VIDEO_RECORD: artifactMode.default('off'),

  // Testomat.io reporter API key. Empty = results are not published.
  // Not the MCP token — see ai/skills/testomatio-mcp/references/tools.md.
  TESTOMATIO: Joi.string().allow('').default(''),
}).unknown(true);

type TestEnv = {
  DEV_BASE_APP_URL: string;
  DEV_API_URL: string;
  CI: boolean;
  FULLY_PARALLEL: boolean;
  WORKERS: number;
  RETRIES: number;
  REPEAT: number;
  TEST_TIMEOUT: number;
  EXPECT_TIMEOUT: number;
  TRACE_VALUE: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  VIDEO_RECORD: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  TESTOMATIO: string;
};

const { value, error } = schema.validate(process.env, {
  convert: true,
  abortEarly: false,
});

if (error) {
  const details = error.details.map(d => `  - ${d.message}`).join('\n');
  throw new Error(
    `Invalid test environment (${join(PACKAGE_ROOT, '.env')}):\n${details}\n` +
      `Copy .env.example to .env and fill the required values.`,
  );
}

export const env = value as TestEnv;

export const DEV_BASE_URL: string = env.DEV_BASE_APP_URL;
export const API_URL: string = env.DEV_API_URL;
