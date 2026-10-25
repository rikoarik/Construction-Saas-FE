import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkSourceText } from "../scripts/check-hardcoded-ui-copy.mjs";

const messagesDirectory = new URL("../messages/", import.meta.url);

async function loadCatalog(locale) {
  return JSON.parse(await readFile(new URL(`${locale}.json`, messagesDirectory), "utf8"));
}

function flatten(value, prefix = "", entries = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) flatten(child, path, entries);
    else entries.set(path, child);
  }
  return entries;
}

test("English and Indonesian message catalogs have the same keys", async () => {
  const [english, indonesian] = await Promise.all([loadCatalog("en"), loadCatalog("id")]);
  assert.deepEqual([...flatten(indonesian).keys()].sort(), [...flatten(english).keys()].sort());
});

test("message catalogs include namespaces used by the app", async () => {
  for (const locale of ["en", "id"]) {
    const messages = await loadCatalog(locale);
    for (const namespace of ["common", "home"]) {
      assert.ok(messages[namespace], `${locale}.${namespace} namespace is required`);
      assert.ok(Object.keys(messages[namespace]).length > 0);
    }
  }
});

test("visible and accessible JSX copy is sourced from translations", () => {
  const violations = checkSourceText([
    {
      file: "good.tsx",
      source: `export function Good({ t }) { return <><h1>{t("title")}</h1><img alt={t("alt")} /><a aria-label={t("link")} /><span>{count}%</span><div className={active ? "open" : "closed"} /></>; }`,
    },
    {
      file: "bad.tsx",
      source: `export function Bad() { return <><h1>Hardcoded title</h1><button aria-label="Close">Close</button><input placeholder="Search" /></>; }`,
    },
  ]);

  assert.deepEqual(
    violations.map(({ file, kind, value }) => [file, kind, value]),
    [
      ["bad.tsx", "text", "Hardcoded title"],
      ["bad.tsx", "aria-label", "Close"],
      ["bad.tsx", "text", "Close"],
      ["bad.tsx", "placeholder", "Search"],
    ],
  );
});
