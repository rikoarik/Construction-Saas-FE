# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Repository identity: Frontend

This `CLAUDE.md` is specifically for the **Construction-Saas-FE frontend repository**. It applies to the web frontend and Telegram Mini App UI only—not the Go backend or Telegram Bot/webhook implementation, which belong to a separate repository.

## Repository status and scope

This checkout is currently a **documentation-only frontend repository**. It has no application source, package manifest, build configuration, or test suite. Consequently, build, lint, run, and single-test commands are not available yet. Do not infer commands from the proposed stack; when implementation and manifests are added, use their scripts and document the supported single-test invocation.

The repository owns the **web frontend and Telegram Mini App UI only**. Telegram Bot/webhook behavior and Go backend implementation belong to the backend repository. The README describes this checkout as a documentation pack for the frontend repository; `README-DOCS.md` says the docs are copied into that repository. Do not add backend or bot implementation here.

## Start here

Read `AGENTS.md` before implementation. It defines the canonical reading order, task lanes, repository ownership, and engineering rules. Then consult the relevant documents:

- Product scope and domain outcomes: `docs/product/PRD.md`.
- Web frontend architecture and implementation boundaries: `docs/frontend/FRONTEND.md`.
- Visual system: `docs/frontend/DESIGN.md`.
- Telegram embedded UI: `docs/frontend/TELEGRAM-MINI-APP.md`.
- Frontend API consumer contract: `docs/contracts/API-CONTRACT-MIRROR.md`.
- Task acceptance and delivery: `docs/delivery/FRONTEND-TASKS.md`, `docs/frontend/FRONTEND-ACCEPTANCE.md`, and `docs/delivery/PARALLEL-WORKFLOW.md` as relevant.

`docs/contracts/API-CONTRACT-MIRROR.md` is read-only. Its canonical source is the backend repository's `docs/API-CONTRACT.md`; the frontend architecture describes `backend/api/openapi.yaml` as the intended executable contract and source for generated TypeScript client/types. Confirm the current canonical contract with the integration lane rather than inventing API shapes.

## Product and architecture

This is a proposed multi-tenant construction SaaS for Indonesian contractors. Its core flow connects approved budget versions and planned baselines to field reports, review/approval, progress, and published weekly reports and schedule/S-curve documents. Project templates and work breakdown/location structures should support different project types through shared domain models and configuration, not per-type code forks. These are product requirements, not claims that the features already exist in this checkout.

The planned frontend stack is Next.js App Router with TypeScript. The documented architecture divides the application into localized web routes and a focused Telegram Mini App surface, shared UI/layout and domain components, a typed API client, and server-state management. The intended tools include next-intl, TanStack Query, React Hook Form, Zod, and semantic CSS theme tokens. Treat this as a target architecture, not existing code: inspect the actual source and manifests once they are introduced.

The architectural boundary is contract-first and backend-authoritative:

- Generate API types/client helpers from the canonical OpenAPI contract; do not hand-invent duplicate request/response types. Contract-ready fixtures may support parallel frontend work.
- The backend owns permissions, tenant isolation, subscription enforcement, calculations, approvals, and official publication. The frontend presents server-provided capabilities and results; client validation is usability support, not authority.
- API decimal values are JSON strings. Preserve contract date/time and error conventions; map stable backend error codes to localized UI messages rather than showing raw backend strings.
- Approved reports post progress to an auditable ledger once. Official documents use versioned snapshots so prior publications remain reproducible; the frontend must show server-confirmed state and must not optimistically finalize consequential actions.
- The Telegram Mini App is a touch-first field-report UI using the same API and domain rules, not a reduced desktop dashboard. Forward Telegram initialization data to the backend for verification; never treat client-supplied Telegram data as authorization. Offline behavior must not imply a draft was saved or submitted when it was not.
- API and database details, webhook handling, and Bot API behavior remain outside this frontend repository.

## Cross-cutting UI contract

All user-visible strings, including accessibility labels and validation copy, use localization keys: English is the default and Indonesian is supported. Light, dark, and system themes are first-class and use semantic design tokens. Follow `docs/frontend/DESIGN.md` for visual decisions; use Lucide for functional icons, not emoji, and avoid decorative card walls. Web flows should meet the documented accessibility and responsive requirements; field flows prioritize touch targets and concise task-based actions.

## Existing repository instructions

`AGENTS.md` is the canonical engineering and task workflow source. `.cursor/rules/00-project.mdc`, `.github/copilot-instructions.md`, and `GEMINI.md` all direct agents to follow it and the domain documents; they do not define separate implementation rules. `README-DOCS.md` confirms the documentation-pack purpose and points readers to the frontend documentation. No application commands can be derived from these files.
