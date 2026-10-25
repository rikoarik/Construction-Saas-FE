# Backend Agent Rules

This repository contains **backend core and Telegram Bot as separate lanes**.

Route work by task prefix:

- `BE-*` -> read `docs/backend/BACKEND.md`, `docs/delivery/BACKEND-TASKS.md`, and `docs/backend/BACKEND-ACCEPTANCE.md`.
- `BOT-*` -> read `docs/bot/BOT.md`, `docs/delivery/BOT-TASKS.md`, and `docs/bot/BOT-ACCEPTANCE.md`.

Shared backend references live in `docs/architecture/`, `docs/specs/`, and `docs/product/PRD.md`.

Hard rules:

- PostgreSQL is authoritative storage; no Supabase dependency;
- tenant isolation and authorization are backend responsibilities;
- progress/RAB/approval calculations live in backend core only;
- Telegram Bot is an adapter, never a second business-logic implementation;
- bot code must not directly recreate or bypass domain rules;
- financial/quantity values use precise decimal/numeric semantics;
- approved progress is audit-safe and idempotent;
- API/worker mutations use explicit transactions where invariants span writes;
- changes to canonical contracts are reviewed before consumer changes;
- do not mark tasks done without repository evidence/tests.

For parallel sessions follow `docs/delivery/PARALLEL-WORKFLOW.md` and respect lane ownership.
