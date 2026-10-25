# Frontend Task Backlog — Full Product

**Owner:** frontend lane · **Status:** 3 verified complete, 1 in progress, 69 planned/blocked (73 task IDs total; 70 not yet verified).

Status is recorded inline as `verified`, `in progress`, `planned`, or `blocked`. Dependency references are not task rows. `verified` requires the row's stated done evidence; commits alone are not sufficient. FE-001–FE-003 have implementation commits pushed on their respective branches; FE-004 is the next active task. The remaining backlog stays open until its acceptance evidence is present.

Frontend work may begin against contract-ready OpenAPI mocks without waiting for backend implementation. UI must follow `docs/frontend/DESIGN.md`, `docs/frontend/FRONTEND.md`, and for Telegram UI `docs/frontend/TELEGRAM-MINI-APP.md`. Telegram Bot API/webhook work is not a frontend task and lives in the backend repository as `docs/delivery/BOT-TASKS.md` in the backend repository.

## F0 — Application shell, design system, i18n

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-001 | Next.js app scaffold, lint/test/build | — | CI passes | **verified** — pushed commit `9f8afc2` (`feat/fe-001-app-scaffold`); scaffold and app scripts present |
| FE-002 | semantic design tokens light/dark/system | FE-001 | visual checks both themes | **verified** — pushed commit `c95da2d` (`feat/fe-003-i18n`); visual verification record below |
| FE-003 | next-intl English/Indonesian foundation | FE-001 | no hardcoded UI-copy lint/check | **verified** — pushed commits `fe38e93`, `c95da2d`; locale catalogs/parity and hardcoded-copy checks present |
| FE-004 | icon/asset conventions + SVG empty-state framework | FE-002 | asset review | **in progress** — empty-state framework/assets and asset review not yet evidenced on the tracked task branch |
| FE-005 | accessible primitives: buttons/forms/dialogs/table chrome | FE-002,FE-003 | component/a11y tests | planned — acceptance evidence not yet recorded |
| FE-006 | project/company application shell | FE-005 | responsive shell tests | blocked — prerequisite FE-005 not verified |
| FE-007 | generated OpenAPI client + mock server | FE-001 | contract fixture tests | planned — acceptance evidence not yet recorded |
| FE-008 | error/capability handling layer | FE-003,FE-007 | error-code UI tests | blocked — prerequisite FE-007 not verified |


### FE-002 visual verification record

- **Checked:** 2026-10-25 against the production build served from `apps/web`.
- **Desktop light/dark:** 1440×1000 screenshots reviewed; light surfaces (`#F7F7F2`) and dark surfaces (`#171A15`) were legible, controls and labels remained distinguishable.
- **Mobile light/dark:** 390×844 screenshots reviewed; shell and main actions fit the viewport, with 16px content gutters and no visible horizontal overflow.
- **Theme interactions:** selected Dark and Light, confirmed `data-theme`, computed body background, `aria-pressed`, localStorage and the `construction-saas-theme` cookie update; reloaded and confirmed the selected theme persisted. Switched to System and emulated both OS color schemes, confirming System followed each change and remained the selected option.
- **Initial paint:** production HTML SSR used the saved theme cookie for the ThemeProvider snapshot; theme CSS values were present before hydration. The provider keeps the server and hydration snapshots consistent.
- **Print and reduced motion:** print styles restore the full light semantic palette; reduced-motion CSS disables transitions/animations.
- **Not yet satisfied:** the control is still only in the top bar (DESIGN requires user menu and Appearance settings); touch hit area is below the documented 44 px minimum; unavailable destination routes/interactive company switching remain blocked by later tasks.


## F1 — Identity, company, project navigation

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-010 | login/session/recovery UI | FE-005,FE-007 | e2e mock tests | blocked — prerequisite FE-005, FE-007 not verified |
| FE-011 | invitation acceptance and company switcher | FE-006,FE-007 | multi-company states | blocked — prerequisite FE-006, FE-007 not verified |
| FE-012 | company member/role management | FE-006,FE-007 | permission UI states | blocked — prerequisite FE-006, FE-007 not verified |
| FE-013 | project list/search/filter/create | FE-006,FE-007 | responsive route tests | blocked — prerequisite FE-006, FE-007 not verified |
| FE-014 | project overview shell | FE-013 | empty/full/long-data visuals | blocked — prerequisite FE-013 not verified |
| FE-015 | project team and access page | FE-012,FE-014 | role-aware tests | blocked — prerequisite FE-012, FE-014 not verified |

## F2 — WBS, locations, contracts

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-020 | project contract/settings forms | FE-014 | validation/localization tests | blocked — prerequisite FE-014 not verified |
| FE-021 | WBS tree/table editor | FE-014 | 1000+ item performance test | blocked — prerequisite FE-014 not verified |
| FE-022 | location/zone/STA hierarchy UI | FE-014 | building/road fixtures | blocked — prerequisite FE-014 not verified |
| FE-023 | project template selection/customization | FE-021,FE-022 | template states | blocked — prerequisite FE-021, FE-022 not verified |

## F3 — RAB / BoQ

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-030 | budget versions page | FE-014,FE-007 | version-state tests | blocked — prerequisite FE-014, FE-007 not verified |
| FE-031 | XLSX upload/import stepper | FE-030 | loading/error/retry states | blocked — prerequisite FE-030 not verified |
| FE-032 | sheet/header/column mapping UI | FE-031 | keyboard/table tests | blocked — prerequisite FE-031 not verified |
| FE-033 | row validation/preview UI | FE-032 | large/error fixtures | blocked — prerequisite FE-032 not verified |
| FE-034 | dense budget/WBS value table | FE-030 | responsive + numeric alignment | blocked — prerequisite FE-030 not verified |
| FE-035 | budget approval/read-only history | FE-030 | capability tests | blocked — prerequisite FE-030 not verified |
| FE-036 | addendum/version comparison UI | FE-035 | historical diff fixtures | blocked — prerequisite FE-035 not verified |
| FE-037 | saved import mapping management | FE-032 | scoped settings tests | blocked — prerequisite FE-032 not verified |

## F4 — Planning / Time Schedule

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-040 | baseline versions and status page | FE-014 | state tests | blocked — prerequisite FE-014 not verified |
| FE-041 | weekly allocation grid | FE-034,FE-040 | keyboard/large-grid tests | blocked — prerequisite FE-034, FE-040 not verified |
| FE-042 | S-curve planned preview | FE-041 | chart + data table | blocked — prerequisite FE-041 not verified |
| FE-043 | baseline approval/history/rebaseline comparison | FE-040 | version tests | blocked — prerequisite FE-040 not verified |

## F5 — Field reporting

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-050 | daily/field report list/filter | FE-014 | state/filter tests | blocked — prerequisite FE-014 not verified |
| FE-051 | report create/edit form | FE-050 | quantity/milestone/percent variants | blocked — prerequisite FE-050 not verified |
| FE-052 | work/location picker optimized for field use | FE-051 | mobile tests | blocked — prerequisite FE-051 not verified |
| FE-053 | evidence photo/file upload UX | FE-051 | progress/retry/error states | blocked — prerequisite FE-051 not verified |
| FE-054 | submit/revision/resubmit UX | FE-051 | state-machine tests | blocked — prerequisite FE-051 not verified |
| FE-055 | typed custom fields renderer | FE-051 | schema fixtures | blocked — prerequisite FE-051 not verified |

## F6 — Approval and progress controls

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-060 | approval queue | FE-050 | dense desktop/mobile states | blocked — prerequisite FE-050 not verified |
| FE-061 | report review/evidence/measurement view | FE-060 | keyboard/mobile tests | blocked — prerequisite FE-060 not verified |
| FE-062 | approve/reject/request-revision actions | FE-061 | conflict/version handling | blocked — prerequisite FE-061 not verified |
| FE-063 | project progress dashboard | FE-014 | role-aware views | blocked — prerequisite FE-014 not verified |
| FE-064 | actual vs planned S-curve | FE-063 | accessible chart/table | blocked — prerequisite FE-063 not verified |
| FE-065 | work-item progress drilldown | FE-063 | large-WBS tests | blocked — prerequisite FE-063 not verified |
| FE-066 | delay/overrun/exception surfaces | FE-063 | human CTA and status tests | blocked — prerequisite FE-063 not verified |

## F7 — Official documents

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-070 | report-period/document list | FE-014 | status/version tests | blocked — prerequisite FE-014 not verified |
| FE-071 | weekly report preview chrome | FE-070 | print-theme visual tests | blocked — prerequisite FE-070 not verified |
| FE-072 | time-schedule/S-curve preview | FE-070 | print-theme tests | blocked — prerequisite FE-070 not verified |
| FE-073 | publish/reissue/download UX | FE-071,FE-072 | capability/audit states | blocked — prerequisite FE-071, FE-072 not verified |
| FE-074 | company branding/signatory settings | FE-070 | theme-independent print preview | blocked — prerequisite FE-070 not verified |
| FE-075 | report-template configuration UI | FE-074 | validation/preview tests | blocked — prerequisite FE-074 not verified |

## F8 — Telegram Mini App and notification UI

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-080 | Telegram linking UI from web | FE-011 | expired/revoked states | blocked — prerequisite FE-011 not verified |
| FE-081 | Mini App shell/session bootstrap | FE-007 | host/theme states | blocked — prerequisite FE-007 not verified |
| FE-082 | Mini App project/report list | FE-081 | mobile tests | blocked — prerequisite FE-081 not verified |
| FE-083 | Mini App field report form | FE-082,FE-051 | touch/mobile tests | blocked — prerequisite FE-082, FE-051 not verified |
| FE-084 | Mini App evidence/upload/submission | FE-083 | poor-network states | blocked — prerequisite FE-083 not verified |
| FE-085 | notification center/preferences | FE-006 | in-app/Telegram preference states | blocked — prerequisite FE-006 not verified |

## F9 — Costs and materials

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-090 | expense/commitment list and forms | FE-014 | accounting-neutral labels/tests | blocked — prerequisite FE-014 not verified |
| FE-091 | cost vs budget/progress view | FE-090,FE-063 | reconciliation display tests | blocked — prerequisite FE-090, FE-063 not verified |
| FE-092 | vendor/cost-code management UI | FE-090 | CRUD states | blocked — prerequisite FE-090 not verified |
| FE-093 | material catalog | FE-014 | table/form tests | blocked — prerequisite FE-014 not verified |
| FE-094 | stock movement forms | FE-093 | unit/validation tests | blocked — prerequisite FE-093 not verified |
| FE-095 | project stock/consumption view | FE-094 | movement history states | blocked — prerequisite FE-094 not verified |

## F10 — SaaS administration and billing

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-100 | plan/usage/entitlement page | FE-011 | limit/read-only states | blocked — prerequisite FE-011 not verified |
| FE-101 | subscription lifecycle UI | FE-100 | grace/cancel states | blocked — prerequisite FE-100 not verified |
| FE-102 | platform tenant admin console | FE-006 | support-access boundaries | blocked — prerequisite FE-006 not verified |
| FE-103 | support access request/indicator | FE-102 | explicit consent/audit UI | blocked — prerequisite FE-102 not verified |

## F11 — Enterprise, scale, quality

| ID | Outcome | Depends on | Done evidence | Status / evidence |
|---|---|---|---|---|
| FE-110 | SSO organization setup UI | FE-011 | provider/error states | blocked — prerequisite FE-011 not verified |
| FE-111 | audit log explorer/export UI | FE-014 | filter/pagination tests | blocked — prerequisite FE-014 not verified |
| FE-112 | delegated approval settings | FE-060 | role/time-bound states | blocked — prerequisite FE-060 not verified |
| FE-113 | accessibility regression suite | all major surfaces | WCAG checks | planned — acceptance evidence not yet recorded |
| FE-114 | light/dark visual regression suite | all major surfaces | screenshot baselines | planned — acceptance evidence not yet recorded |
| FE-115 | localization completeness gate | all major surfaces | en/id parity check | planned — acceptance evidence not yet recorded |
| FE-116 | large-data/performance hardening | budget/schedule/report views | measured benchmark | planned — acceptance evidence not yet recorded |
| FE-117 | responsive/mobile hardening | all field workflows | 360/390/768/1024/1440 checks | planned — acceptance evidence not yet recorded |
