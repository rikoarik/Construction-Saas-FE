import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkSourceText } from "../scripts/check-hardcoded-ui-copy.mjs";

const catalogs = Object.fromEntries(
  await Promise.all(
    ["en", "id"].map(async (locale) => [
      locale,
      JSON.parse(
        await readFile(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"),
      ),
    ]),
  ),
);

function flatten(value, prefix = "", entries = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, path, entries);
    } else {
      entries.set(path, child);
    }
  }
  return entries;
}

function hasLocalizedValue(enValue, idValue) {
  if (typeof enValue !== "string" || typeof idValue !== "string") return true;
  return enValue.trim() !== idValue.trim();
}

test("English and Indonesian message catalogs have the same keys", () => {
  assert.deepEqual(
    [...flatten(catalogs.en).keys()].sort(),
    [...flatten(catalogs.id).keys()].sort(),
  );
});

test("login form translation keys exist in both locales", async () => {
  const source = await readFile(new URL("../components/auth/login-form.tsx", import.meta.url), "utf8");
  const keys = [...source.matchAll(/\bt\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(keys.length > 0, "no login form translation keys found");
  for (const locale of ["en", "id"]) {
    for (const key of keys) {
      assert.equal(typeof catalogs[locale].auth[key], "string", `${locale}: missing auth.${key}`);
    }
  }
});

test("localized catalogs have corresponding user-facing values", () => {
  const enEntries = flatten(catalogs.en);
  const idEntries = flatten(catalogs.id);
  // Proper names, shared loanwords, identifiers, and integer quantities do not
  // change between locales. Keep this explicit so untranslated prose still fails.
  const localeInvariantKeys = new Set([
    "common.brand", "common.brandMark", "auth.brand", "auth.email", "platform.brand", "platform.title", "landing.nav.pilot",
    "landing.hero.reportLocation", "landing.hero.reportCode",
    "landing.explorer.status", "landing.explorer.telegram",
    "landing.explorer.buildingQuantity4",
    ...[1, 2, 3].map((i) => `landing.explorer.report${i}Code`),
    ...["road", "building"].flatMap((project) =>
      [1, 2, 3, 4].flatMap((i) => [
        `landing.explorer.${project}Code${i}`,
        `landing.explorer.${project}Progress${i}`,
      ]),
    ),
  ]);
  const untranslated = [...enEntries].filter(([key, value]) =>
    !localeInvariantKeys.has(key) && !hasLocalizedValue(value, idEntries.get(key)),
  );

  assert.deepEqual(untranslated, []);
});

test("visible and accessible JSX copy is sourced from translations", () => {
  const violations = checkSourceText([
    {
      file: "good.tsx",
      source: `export function Good({ t }) { return <><h1>{t("title")}</h1><img alt={t("alt")} /><a aria-label={t("link")} /></>; }`,
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
