import { readdir, readFile } from "node:fs/promises";

const messagesDirectory = new URL("../messages/", import.meta.url);
const localeFiles = new Map([
  ["en.json", "en"],
  ["id.json", "id"],
]);
const files = (await readdir(messagesDirectory))
  .filter((file) => localeFiles.has(file))
  .sort();
const localeCatalogs = new Map();
const errors = [];

function flatten(value, prefix = "", result = new Set()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, path, result);
    } else {
      result.add(path);
    }
  }
  return result;
}

for (const file of files) {
  const locale = localeFiles.get(file);
  const contents = await readFile(new URL(file, messagesDirectory), "utf8");
  localeCatalogs.set(locale, flatten(JSON.parse(contents)));
}

for (const [file, locale] of localeFiles) {
  if (!localeCatalogs.has(locale)) errors.push(`${file}: catalog is missing`);
}

const englishKeys = localeCatalogs.get("en");
const indonesianKeys = localeCatalogs.get("id");
if (englishKeys && indonesianKeys) {
  for (const key of englishKeys) {
    if (!indonesianKeys.has(key)) errors.push(`id.json: missing message ${key}`);
  }
  for (const key of indonesianKeys) {
    if (!englishKeys.has(key)) errors.push(`en.json: missing message ${key}`);
  }
}

if (errors.length > 0) {
  console.error("Translation catalogs do not have matching keys:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("English and Indonesian message catalogs match.");
}
