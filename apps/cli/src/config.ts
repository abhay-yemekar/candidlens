/**
 * CLI configuration: connection profile persisted to disk so commands
 * after `candidlens login` reuse the session cookie. It lives in
 * ~/.candidlens, overridable via CANDIDLENS_CONFIG_DIR (used by tests and
 * CI). A session saved in ~/.hirelens before the rename is still read.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CliConfig {
  /** Base URL of the CandidLens API. */
  baseUrl: string;
  /** Better-Auth session cookie (the `better-auth.session_token=…` pair). */
  cookie?: string | undefined;
  /** Email of the signed-in user, display purposes only. */
  email?: string | undefined;
}

/**
 * A setting by its name without the prefix. Settings were renamed from
 * HIRELENS_* to CANDIDLENS_*; the old names still work. An empty new value
 * counts as unset. (Mirrors readSetting in core: the CLI has no runtime
 * dependencies.)
 */
export function setting(name: string): string | undefined {
  const current = process.env[`CANDIDLENS_${name}`];
  return current !== undefined && current !== "" ? current : process.env[`HIRELENS_${name}`];
}

/** HOME when set (as before); otherwise the OS home folder, not the cwd. */
function homeDir(): string {
  return process.env["HOME"] || homedir();
}

function configDir(): string {
  return setting("CONFIG_DIR") ?? join(homeDir(), ".candidlens");
}

function configFile(): string {
  return join(configDir(), "config.json");
}

/**
 * The file to read: the current one, or else the session the CLI saved in
 * ~/.hirelens before the rename. The next save writes ~/.candidlens; the
 * old file is left alone. An explicit CONFIG_DIR never falls back.
 */
function readableConfigFile(): string | undefined {
  const current = configFile();
  if (existsSync(current)) return current;
  if (setting("CONFIG_DIR")) return undefined;
  const legacy = join(homeDir(), ".hirelens", "config.json");
  return existsSync(legacy) ? legacy : undefined;
}

export function defaultBaseUrl(): string {
  return setting("API_URL") ?? "http://localhost:4000";
}

export function loadConfig(): CliConfig {
  // CI / one-shot usage: cookie straight from the environment wins.
  const envCookie = setting("COOKIE");
  const envUrl = setting("API_URL");
  const source = readableConfigFile();
  const file: CliConfig = source
    ? (JSON.parse(readFileSync(source, "utf8")) as CliConfig)
    : { baseUrl: defaultBaseUrl() };
  return {
    ...file,
    ...(envUrl ? { baseUrl: envUrl } : {}),
    ...(envCookie ? { cookie: envCookie } : {}),
  };
}

export function saveConfig(config: CliConfig): void {
  mkdirSync(configDir(), { recursive: true });
  writeFileSync(configFile(), `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

export function clearSession(): void {
  const config = loadConfig();
  saveConfig({ baseUrl: config.baseUrl });
}
