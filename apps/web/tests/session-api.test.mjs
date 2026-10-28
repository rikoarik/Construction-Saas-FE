import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test, afterEach } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../lib/api/session.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("login posts only to same-origin API and does not fetch CSRF", async () => {
  const calls = [];
  globalThis.fetch = async (...args) => { calls.push(args); return new Response(null, { status: 204 }); };
  await api.login({ email: "person@example.test", password: "secret" });
  assert.equal(calls.length, 1);
  const [url, options] = calls[0];
  assert.equal(url, "/api/v1/auth/login");
  assert.equal(options.credentials, "same-origin");
  assert.equal(options.redirect, "error");
  assert.equal(options.cache, "no-store");
  assert.deepEqual(JSON.parse(options.body), { email: "person@example.test", password: "secret" });
});

test("logout obtains a fresh CSRF token before each mutation", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    return url.endsWith("/csrf") ? Response.json({ csrf_token: "a".repeat(32) }) : new Response(null, { status: 204 });
  };
  await api.logout();
  await api.logout();
  assert.deepEqual(calls.map(([url]) => url), ["/api/v1/auth/csrf", "/api/v1/auth/logout", "/api/v1/auth/csrf", "/api/v1/auth/logout"]);
  assert.equal(calls[1][1].headers["X-CSRF-Token"], "a".repeat(32));
  assert.ok(calls.every(([, options]) => options.credentials === "same-origin" && options.cache === "no-store" && options.redirect === "error"));
});

test("failed or malformed CSRF prevents logout", async () => {
  for (const response of [new Response("private server detail", { status: 401 }), Response.json({ csrf_token: "short" }), Response.json(null), new Response("bad json")]) {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return response; };
    await assert.rejects(api.logout(), (error) => error instanceof api.ApiError && !error.message.includes("private"));
    assert.equal(calls, 1);
  }
});

test("unexpected successful status is not treated as a completed login", async () => {
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(api.login({ email: "person@example.test", password: "secret" }), (error) => error.kind === "invalid_response");
});
