import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const names = [
  "empty-projects", "empty-budget", "empty-schedule", "empty-reports",
  "empty-documents", "state-no-access", "state-offline",
];

for (const name of names) {
  test(`${name} is a safe landscape line illustration`, async () => {
    const svg = await readFile(new URL(`../public/illustrations/${name}.svg`, import.meta.url), "utf8");
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 240 144" fill="none">/);
    assert.match(svg, /stroke="#000" stroke-width="1\.8"/);
    assert.doesNotMatch(svg, /<(?:script|image|foreignObject)\b|<animate\b|<linearGradient\b|<radialGradient\b|data:|href=|<text\b/i);
  });
}

test("filtered and quiet states do not show first-use illustrations", async () => {
  const component = await readFile(new URL("../components/illustrations/empty-state.tsx", import.meta.url), "utf8");
  assert.match(component, /kind === "first-use" && illustration/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /title: string/);
});
