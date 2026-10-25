import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const messagesDirectory = new URL("../messages/", import.meta.url);

function flattenKeys(value, prefix = "", keys = new Set()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      flattenKeys(child, path, keys);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

test("English and Indonesian message catalogs have the same keys", async () => {
  const [english, indonesian] = await Promise.all([
    readFile(new URL("en.json", messagesDirectory), "utf8").then(JSON.parse),
    readFile(new URL("id.json", messagesDirectory), "utf8").then(JSON.parse),
  ]);
  const englishKeys = flattenKeys(english);
  const indonesianKeys = flattenKeys(indonesian);

  assert.deepEqual([...indonesianKeys].sort(), [...englishKeys].sort());
});

test("message catalogs have localized common and home namespaces", async () => {
  for (const locale of ["en", "id"]) {
    const messages = JSON.parse(
      await readFile(new URL(`${locale}.json`, messagesDirectory), "utf8"),
    );

    assert.ok(messages.common);
    assert.ok(messages.home);
    assert.ok(Object.keys(messages.common).length > 0);
    assert.ok(Object.keys(messages.home).length > 0);
  }
});
