# Company admin frontend delivery

This sequence complements `FRONTEND-TASKS.md`; it does not certify or replace its prerequisites. Company admin means an authenticated company owner or administrator, not a platform operator. The current `/app` is a preview, not an authenticated workspace. Never show preview content as real company data. Status reflects repository evidence, not planned backend functionality.

| ID | Outcome | Depends on | Acceptance evidence | Status |
|---|---|---|---|---|
| CA-FE-01 | Generate TypeScript declarations from the canonical backend OpenAPI | Backend `api/openapi.yaml` available locally | Reproducible generation and drift check, typecheck | Verified: generated declarations and `api:check`, typecheck, lint, 13 tests and production build pass locally (2026-10-28). This is not the complete FE-007 client or mock server. |
| CA-FE-02 | Authenticated API transport and session handling | CA-FE-01, FE-005, backend login/session and deployment configuration | Cookie and CSRF handling, safe errors, sign-out cache clearing, contract integration tests | Blocked: FE-005 and deployable backend/session integration not verified. |
| CA-FE-03 | Company selection and tenant-scoped shell | CA-FE-02, FE-006; `listCompanies` contract | Loading/empty/error and multi-company tests; scope changes clear prior data | Blocked: shell and session prerequisites. |
| CA-FE-04 | Company member list | CA-FE-03; `listCompanyMembers` contract and backend authorization | Responsive en/id light/dark states, forbidden/empty/error tests and real API integration | Blocked: tenant scope/session prerequisites; list contract provides a limit but no cursor parameter, so do not invent pagination. |
| CA-FE-05 | Invite a company member and review invitations | CA-FE-04; invitation operations, CSRF and backend delivery decision | Validation, server errors, one-time token handling without leaking it; accessible browser and integration tests | Blocked: prerequisites and invitation delivery/acceptance flow must be confirmed. |
| CA-FE-06 | Manage member roles and removal | CA-FE-05 and reviewed backend operations | Permission, conflict and tenant isolation tests | Blocked: canonical OpenAPI currently defines neither role update nor removal. Do not guess endpoints. |
| CA-FE-07 | Company projects and administrative settings | CA-FE-03 and reviewed project/settings contracts | Authorized API-backed flows, responsive and accessibility tests | Blocked: canonical OpenAPI currently lacks company project list/create and settings operations, despite the older prose mirror. |

Verification for each screen includes keyboard, 375px and desktop, English/Indonesian, light/dark, loading/empty/error/permission states, and real backend authorization. Mock tests alone do not prove a usable production integration.

## Contract generation

From `apps/web`, `npm run api:generate` and `npm run api:check` use the sibling checkout `../../../Construction-Saas-BE/api/openapi.yaml`. The backend OpenAPI is a draft and may describe endpoints not yet implemented. Consumers with another checkout layout must supply the same canonical contract via an equivalent local path; do not silently substitute the older prose mirror. Commit regenerated declarations with intentional contract changes and review the diff. These declarations alone do not create an API client, authentication, fixtures, or an admin UI.
