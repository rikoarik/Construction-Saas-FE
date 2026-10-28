<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reusable UI controls

New frontend controls should use `components/ui/primitives.tsx` (Button with circular `busy` state, TextField, SelectField, DateField, Dialog) and `components/ui/notice-toast.tsx` for notifications. Do not duplicate raw controls or bespoke loading text without a documented exception. See `components/ui/AGENTS.md` for validation, keyboard, theme, and toast rules. Existing specialized controls may remain until migrated without losing behavior.
