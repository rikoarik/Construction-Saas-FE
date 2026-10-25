# Construction SaaS Frontend

Frontend application for web and Telegram Mini App experiences.

## Development

Run commands from `apps/web`:

```bash
npm install
npm run dev
```

## Verification

```bash
npm run test
npm run lint
npm run typecheck
npm run check:messages
npm run check:ui-copy
npm run check:metadata
npm run build
```

Run one test file with `node --test tests/messages.test.mjs`.

## Project documentation

See the repository-root `AGENTS.md` for workflow and ownership rules. Frontend architecture, visual design, task acceptance, Telegram Mini App behavior, product requirements, and the read-only API contract mirror are documented under the root `docs/` directory.
