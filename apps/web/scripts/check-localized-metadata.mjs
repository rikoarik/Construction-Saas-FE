import { readFile } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";

const appDirectory = new URL("../app/", import.meta.url).pathname;
const localeLayoutPath = join(appDirectory, "[locale]", "layout.tsx");
const rootLayoutPath = join(appDirectory, "layout.tsx");

function findExportedMetadata(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const metadataVariable = sourceFile.statements.find(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      statement.declarationList.declarations.some(
        (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "metadata",
      ),
  );

  if (!metadataVariable) return undefined;
  const metadataDeclaration = metadataVariable.declarationList.declarations.find(
    (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "metadata",
  );
  return metadataDeclaration?.initializer;
}

const [rootLayout, localeLayout] = await Promise.all([
  readFile(rootLayoutPath, "utf8"),
  readFile(localeLayoutPath, "utf8"),
]);
const rootMetadata = findExportedMetadata(rootLayout, rootLayoutPath);
const rootHasDynamicLocaleDocument = /params:\s*Promise<\{\s*locale:\s*string\s*\}>/.test(rootLayout);
const localizedMetadata = /export\s+async\s+function\s+generateMetadata\s*\(/.test(localeLayout);
const violations = [];

if (rootMetadata && !rootHasDynamicLocaleDocument && !localizedMetadata) {
  violations.push("A static root document defines metadata without locale-aware overrides");
}

if (violations.length) {
  console.error("Localized metadata check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Document metadata is locale-aware or not hardcoded in the root layout.");
}
