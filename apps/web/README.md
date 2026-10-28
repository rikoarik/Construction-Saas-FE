# Construction SaaS Frontend

Frontend application for web and Telegram Mini App experiences.

## Development

Run commands from `apps/web`:

```bash
npm install
npm run dev
```

## Backend routing

Set `BACKEND_ORIGIN` when starting the Next.js server (and when building for production) to the backend's HTTP(S) origin, for example `http://127.0.0.1:8080`. Next.js proxies `/api/v1/*` to that origin; without it, no API rewrite is configured. Do not expose this origin as a public browser API URL. Protect the backend connection and use HTTPS at the public edge in production. Configure the backend `TRUSTED_ORIGINS` with the exact public frontend origin and a stable `CSRF_SECRET`; enable production secure cookies. The proxy must preserve Origin, Sec-Fetch-Site, Cookie, Set-Cookie, and X-CSRF-Token. A separate edge proxy may provide same-origin routing instead. Restart/rebuild after changing the rewrite configuration.

The login page is available at `/en/login` and `/id/login`. After login it returns to the landing page; the company workspace has been removed.

## Verification

```bash
npm run test
npm run lint
npm run typecheck
npm run check:messages
npm run build
```

Run one test file with `node --test tests/messages.test.mjs`.

## Project documentation

See the repository-root `AGENTS.md` for workflow and ownership rules. Frontend architecture, visual design, task acceptance, Telegram Mini App behavior, product requirements, and the read-only API contract mirror are documented under the root `docs/` directory.
