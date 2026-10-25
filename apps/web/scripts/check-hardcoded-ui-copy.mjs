import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const sourceRoot = new URL("../", import.meta.url);
const visibleAttributes = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "label",
  "placeholder",
  "title",
]);
const translationFunctions = new Set(["t", "common", "home", "landing"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (["node_modules", ".next", "tests"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(path)));
    else if (/\.(?:tsx|jsx)$/.test(entry.name)) files.push(path);
  }

  return files;
}

function visibleWords(value) {
  return /[\p{L}]{2}/u.test(value);
}

function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (
    ts.isJsxExpression(node) &&
    node.expression &&
    (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))
  ) return node.expression.text;
  return undefined;
}

function isTranslationCall(node) {
  let expression = node;
  while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
  return (
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    translationFunctions.has(expression.expression.text)
  );
}

function collectLiteralText(node, result = []) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    translationFunctions.has(node.expression.text)
  ) return result;

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (visibleWords(node.text.trim())) result.push(node.text.trim());
    return result;
  }

  ts.forEachChild(node, (child) => collectLiteralText(child, result));
  return result;
}

export function checkSourceText(sources) {
  const violations = [];

  for (const { file, source } of sources) {
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JSX,
    );

    function visit(node) {
      if (
        ts.isJsxElement(node) &&
        ts.isIdentifier(node.openingElement.tagName) &&
        node.openingElement.tagName.text === "Script"
      ) return;

      if (ts.isJsxText(node)) {
        const value = node.getText(sourceFile).trim();
        if (visibleWords(value)) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value });
        }
      } else if (
        ts.isJsxAttribute(node) &&
        ts.isIdentifier(node.name) &&
        visibleAttributes.has(node.name.text)
      ) {
        const value = literalValue(node.initializer)?.trim();
        if (value && visibleWords(value)) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: node.name.text, value });
        }
      } else if (ts.isJsxExpression(node) && node.expression && !isTranslationCall(node.expression)) {
        const attribute = ts.isJsxAttribute(node.parent) ? node.parent : undefined;
        if (attribute && ts.isIdentifier(attribute.name) && !visibleAttributes.has(attribute.name.text)) {
          ts.forEachChild(node, visit);
          return;
        }
        const direct = literalValue(node);
        const values = direct && visibleWords(direct.trim())
          ? [direct.trim()]
          : ts.isBinaryExpression(node.expression) || ts.isConditionalExpression(node.expression)
            ? collectLiteralText(node.expression)
            : [];
        for (const value of values) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return violations;
}

if (process.argv[1] && process.argv[1].endsWith("check-hardcoded-ui-copy.mjs")) {
  const sourceFiles = [
    ...(await collectSourceFiles(new URL("../app/", import.meta.url).pathname)),
    ...(await collectSourceFiles(new URL("../components/", import.meta.url).pathname)),
  ];
  const sources = await Promise.all(sourceFiles.map(async (path) => ({
    file: relative(sourceRoot.pathname, path),
    source: await readFile(path, "utf8"),
  })));
  const violations = checkSourceText(sources);

  if (violations.length > 0) {
    console.error("Hardcoded visible UI copy found. Move user-facing text and accessible names to next-intl catalogs:");
    for (const { file, line, kind, value } of violations) {
      console.error(`${file}:${line}: ${kind}: ${JSON.stringify(value)}`);
    }
    process.exitCode = 1;
  } else {
    console.log("No hardcoded visible UI copy found in app/components TSX/JSX.");
  }
}
