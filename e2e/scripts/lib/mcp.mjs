/**
 * One neutral MCP definition (`ai/mcp/servers.json`) → one config file per host.
 *
 * Hosts disagree on the top-level key, on how a variable is interpolated, and on
 * whether defaults exist at all. Writing three files by hand guarantees drift, so
 * both `sync:ai` and `verify:ai` render them from here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** `${VAR}` or `${VAR:-default}` */
const PLACEHOLDER = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g;

export const HOSTS = {
  claude: { file: ['.mcp.json'], label: 'Claude Code' },
  cursor: { file: ['.cursor', 'mcp.json'], label: 'Cursor' },
  vscode: { file: ['.vscode', 'mcp.json'], label: 'VS Code / Copilot' },
};

export const readDefinition = pkgRoot =>
  JSON.parse(readFileSync(join(pkgRoot, 'ai', 'mcp', 'servers.json'), 'utf8'));

/** Everything is generated inside the test package — the surrounding repo is never touched. */
export const outputPath = (pkgRoot, host) => join(pkgRoot, ...HOSTS[host].file);

/**
 * Rewrites placeholders for one host.
 *
 * - Claude Code understands `${VAR}` and `${VAR:-default}` natively.
 * - Cursor understands `${env:VAR}` but has no default syntax, so a non-secret
 *   default is inlined rather than silently passing an empty string.
 * - VS Code resolves `${input:id}` from a prompt; defaults are inlined the same way.
 */
const rewrite = (value, host, secrets, inputs) =>
  value.replace(PLACEHOLDER, (_match, name, fallback) => {
    const isSecret = secrets.includes(name);
    const hasDefault = fallback !== undefined;

    if (host === 'claude') {
      return hasDefault ? `\${${name}:-${fallback}}` : `\${${name}}`;
    }

    if (hasDefault && !isSecret) return fallback;

    if (host === 'cursor') return `\${env:${name}}`;

    const id = name.toLowerCase().replaceAll('_', '-');
    if (!inputs.some(input => input.id === id)) {
      inputs.push({
        id,
        type: 'promptString',
        description: name,
        password: isSecret,
      });
    }
    return `\${input:${id}}`;
  });

/** Renders the config object a host expects. Returns `null` when no server targets it. */
export function renderConfig(definition, host) {
  const inputs = [];
  const servers = {};
  const render = (value, secrets) => rewrite(value, host, secrets, inputs);

  for (const [name, server] of Object.entries(definition.servers)) {
    if (!server.hosts.includes(host)) continue;

    const secrets = server.secrets ?? [];
    const entry = {
      // VS Code's documented stdio example omits `type`; Claude and Cursor expect it.
      ...(host === 'vscode' ? {} : { type: server.transport }),
      command: server.command,
      args: server.args.map(arg => render(arg, secrets)),
    };

    if (server.env) {
      entry.env = Object.fromEntries(
        Object.entries(server.env).map(([key, value]) => [
          key,
          render(value, secrets),
        ]),
      );
    }

    servers[name] = entry;
  }

  if (Object.keys(servers).length === 0) return null;

  return host === 'vscode'
    ? { ...(inputs.length > 0 && { inputs }), servers }
    : { mcpServers: servers };
}

/** Serialized exactly as Prettier formats JSON, so `format:check` stays green. */
export const serialize = config => `${JSON.stringify(config, null, 2)}\n`;
