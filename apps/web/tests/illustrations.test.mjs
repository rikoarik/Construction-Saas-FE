import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const assetPath = new URL("../public/illustrations/empty-projects.svg", import.meta.url);
const illustrationPath = new URL("../components/illustrations/project-empty-illustration.tsx", import.meta.url);
const frameworkPath = new URL("../components/illustrations/empty-state.tsx", import.meta.url);

test("owned empty-projects SVG follows the theme-safe asset convention", async () => {
  const svg = await readFile(assetPath, "utf8");

  assert.match(svg, /<svg\s[^>]*viewBox="0 0 240 144"/);
  assert.match(svg, /stroke="currentColor"/);
  assert.doesNotMatch(svg, /<(?:script|image|animate|animateTransform)\b|(?:href|xlink:href)=|<linearGradient\b/i);
  assert.doesNotMatch(svg, /#[\da-f]{3,8}\b/i);
  assert.ok((svg.match(/<path\b/g) ?? []).length <= 12);
});

test("inline empty-project illustration is decorative and uses inherited theme color", async () => {
  const source = await readFile(illustrationPath, "utf8");

  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /focusable="false"/);
  assert.match(source, /stroke="currentColor"/);
  assert.match(source, /viewBox="0 0 240 144"/);
});

test("empty-state framework accepts caller-provided localized content and optional action", async () => {
  const source = await readFile(frameworkPath, "utf8");

  assert.match(source, /title: string/);
  assert.match(source, /description\?: string/);
  assert.match(source, /illustration\?: ReactNode/);
  assert.match(source, /action\?: ReactNode/);
  assert.doesNotMatch(source, /useTranslations|href="/);
});
