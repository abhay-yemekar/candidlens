/**
 * Where the CLI keeps its session. The CLI was published as `hirelens`
 * until 1.4.x and saved the session in ~/.hirelens; after the rename it
 * saves to ~/.candidlens but must keep reading an old session (#210).
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig, saveConfig } from "./config.js";

const ENV_KEYS = [
  "HOME",
  "CANDIDLENS_CONFIG_DIR",
  "HIRELENS_CONFIG_DIR",
  "CANDIDLENS_COOKIE",
  "HIRELENS_COOKIE",
  "CANDIDLENS_API_URL",
  "HIRELENS_API_URL",
];

describe("config location", () => {
  let home: string;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    home = mkdtempSync(join(tmpdir(), "candidlens-home-"));
    process.env["HOME"] = home;
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    rmSync(home, { recursive: true, force: true });
  });

  function writeLegacySession(): string {
    const dir = join(home, ".hirelens");
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "config.json");
    writeFileSync(
      file,
      JSON.stringify({ baseUrl: "http://old.example", cookie: "old-cookie", email: "a@b.c" }),
    );
    return file;
  }

  it("reads a session saved in ~/.hirelens before the rename", () => {
    writeLegacySession();
    expect(loadConfig()).toMatchObject({ baseUrl: "http://old.example", cookie: "old-cookie" });
  });

  it("saves to ~/.candidlens, which then wins, and leaves the old file alone", () => {
    const legacy = writeLegacySession();
    saveConfig({ baseUrl: "http://new.example" });

    const current = join(home, ".candidlens", "config.json");
    expect(JSON.parse(readFileSync(current, "utf8"))).toEqual({ baseUrl: "http://new.example" });
    expect(existsSync(legacy)).toBe(true);
    expect(loadConfig()).toEqual({ baseUrl: "http://new.example" });
  });

  it("never falls back to ~/.hirelens when CONFIG_DIR is set", () => {
    writeLegacySession();
    process.env["CANDIDLENS_CONFIG_DIR"] = join(home, "custom");
    expect(loadConfig().cookie).toBeUndefined();
  });

  it("starts empty when neither folder has a session", () => {
    expect(loadConfig()).toEqual({ baseUrl: "http://localhost:4000" });
  });
});
