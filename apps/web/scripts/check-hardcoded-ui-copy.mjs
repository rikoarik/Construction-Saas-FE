import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import ts from "typescript";

const sourceRoot = new URL("../", import.meta.url);
const visibleAttributes = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "label",
  "placeholder",
  "title",
]);
const translationHookNames = new Set(["t", "common", "home", "landing"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "tests") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(path)));
    } else if (/\.(?:tsx|jsx)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function getStringValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (
    ts.isJsxExpression(node) &&
    node.expression &&
    (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))
  ) {
    return node.expression.text;
  }
  return undefined;
}

function isTranslationExpression(node) {
  let expression = node;
  while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
  return (
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    translationHookNames.has(expression.expression.text)
  );
}

function isVisibleLanguageCopy(value) {
  return /[\p{L}]{2}/u.test(value);
}

function collectLiteralText(node, result = []) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    translationHookNames.has(node.expression.text)
  ) {
    return result;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (isVisibleLanguageCopy(node.text.trim())) result.push(node.text.trim());
    return result;
  }
  ts.forEachChild(node, (child) => collectLiteralText(child, result));
  return result;
}

function visitSource(sourceFile, file, violations) {
  function visit(node) {
    if (ts.isJsxElement(node) && ts.isIdentifier(node.openingElement.tagName) && node.openingElement.tagName.text === "Script") {
      return;
    }

    if (ts.isJsxText(node) && isVisibleLanguageCopy(node.getText(sourceFile).trim())) {
      const value = node.getText(sourceFile).trim();
      violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value });
    } else if (ts.isJsxAttribute(node) && node.name && ts.isIdentifier(node.name) && visibleAttributes.has(node.name.text)) {
      const value = getStringValue(node.initializer);
      if (value?.trim() && isVisibleLanguageCopy(value.trim())) {
        violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: node.name.text, value: value.trim() });
      }
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent)) &&
      !isTranslationExpression(node)
    ) {
      const parentAttribute = node.parent && ts.isJsxAttribute(node.parent) ? node.parent : undefined;
      if (
        parentAttribute &&
        ts.isIdentifier(parentAttribute.name) &&
        ["className", "style", "id", "href", "key", "src"].includes(parentAttribute.name.text)
      ) {
        ts.forEachChild(node, visit);
        return;
      }
      const value = getStringValue(node);
      if (value?.trim() && isVisibleLanguageCopy(value.trim())) {
        violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value: value.trim() });
      } else if (node.expression && ts.isBinaryExpression(node.expression)) {
        for (const literal of collectLiteralText(node.expression)) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value: literal });
        }
      } else if (node.expression && ts.isConditionalExpression(node.expression)) {
        for (const literal of collectLiteralText(node.expression.whenTrue)) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value: literal });
        }
        for (const literal of collectLiteralText(node.expression.whenFalse)) {
          violations.push({ file, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, kind: "text", value: literal });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
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
    visitSource(sourceFile, file, violations);
  }

  return violations;
}

if (process.argv[1] && process.argv[1].endsWith("check-hardcoded-ui-copy.mjs")) {
  const sourceFiles = await collectSourceFiles(new URL("../app/", import.meta.url).pathname)
    .then(async (appFiles) => [
      ...appFiles,
      ...(await collectSourceFiles(new URL("../components/", import.meta.url).pathname)),
    ]);
  const sources = await Promise.all(
    sourceFiles.map(async (path) => ({
      file: relative(sourceRoot.pathname, path),
      source: await readFile(path, "utf8"),
    })),
  );
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
