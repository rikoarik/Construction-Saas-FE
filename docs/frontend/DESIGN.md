# DESIGN.md — Product UI System & Frontend Rules

> **Product:** Construction SaaS — multi-company project control  
> **Document ID:** UX-SYS-001  
> **Version:** 2.2.0  
> **Status:** Normative UI implementation specification  
> **Last revised:** 2026-10-25  
> **Applies to:** Next.js web application, responsive views, Telegram Mini App, screen-facing PDF/XLSX previews  
> **Product UI language:** English (`en`) by default; Indonesian (`id`) available through i18n  
> **Scope:** Frontend UI, responsive layouts, interaction states, accessibility, and API consumption contracts

## 0. Purpose, authority, and definition of done

This document is **not a prompt** and is **not a mood board**. It is a set of implementable interface rules, tokens, wireframes, accessibility requirements, component contracts, and review gates. AI coding agents and human developers must use it when creating or changing the product interface.

**Read with the relevant frontend inputs:**

- `docs/product/PRD.md` — functional scope and roles.
- `docs/specs/REPORT-TEMPLATES.md` — weekly physical/financial progress and time schedule.
- `docs/specs/STATE-MACHINES.md` — approvals and publication states.
- `docs/specs/TELEGRAM-INTEGRATION.md` — Mini App host behavior and authenticated API/session contract.
- The typed API contract used by the frontend — field types, precision, units, scope, status values, permissions, pagination, errors, and mutation responses.
- [WIREFRAMES.pdf](WIREFRAMES.pdf) — companion visual layouts; §6 contains screen-level implementation contracts.

When there is a conflict, **approved domain rules and authorization rules take precedence**. UI may not invent, smooth, or alter official quantities, costs, progress, permissions, or approval status for visual convenience. Record product/design decisions through the project change process instead of silently overriding them.

**Scope boundary:** this document specifies the frontend, not backend architecture, database design, infrastructure, or server transaction implementation. Companion product documents and API contracts remain authoritative for business rules. If a referenced rule or API is unavailable, record the dependency and keep any mock data isolated in development; this UI specification does not authorize inventing a production contract.

**Acceptance for a screen:** it must work in light/dark themes, at desktop and supported mobile width, in English and Indonesian, with empty/loading/error/permission states, keyboard navigation, real authorization, real API types, and no fake business numbers presented as production data.

---

## 1. Product design direction

### 1.1 Basalt / Olive

**Design character:** precise, grounded, quiet, practical, slightly editorial. A construction site is busy; its management software should not be. The visual system should feel like a well-designed professional tool, not a landing page, a finance dashboard template, or AI-generated demo.

**Visual DNA:**

- Warm-neutral canvas, graphite typography, sparing *muted olive* accent. **No generic SaaS blue palette.**
- Straightforward geometry; thin separators; restrained radius; almost no shadows.
- Dense data tables and clear filters on desktop; guided tasks and large controls on mobile.
- Typographic hierarchy before color, spacing before containers, borders before shadows.
- First-class dark theme, not a filter or color inversion.
- Visuals communicate a function. Decorative artwork is not required to finish a page.

**UI density budget:** one page heading; one visually dominant primary action per view or task region; no more than 3–4 small top-level metrics in project overview by default; detailed information in tables and drill-down views rather than a screen full of large cards.

### 1.2 Hard anti-AI-slop rules

**Reject the implementation if it contains any of these without an approved exception:**

| Do not ship | Replace with |
|---|---|
| Gradient heroes, blobs, glows, aurora/mesh backgrounds, glassmorphism | Plain, deliberate surfaces with meaningful grouping |
| Default purple/blue brand + colored stat cards on every page | Neutral shell + one olive action color |
| Oversized headlines, giant whitespace, 12 decorative cards | Appropriate information density and clear hierarchy |
| Repetitive rounded cards for a dataset naturally suited to rows | Data table, tree table, list, or split view |
| Stock construction workers, AI illustration filler, cute mascots | Purpose-built SVG diagrams for the *few* empty states that need them |
| Emojis in headings, buttons, navigation, status, alerts, charts | Lucide icons, custom SVGs, descriptive labels |
| Floating pills everywhere, neon strokes, busy chips | Labels, compact text, borders, measured badge use |
| Shimmer loops and motion on every element | Real loading feedback; reduced-motion support |
| Random icon on each section title | Icon only when recognition/action improves |
| Fake values like `72.5%` in production components | Actual API result or a clearly flagged fixture in development only |
| Generic marketing copy such as “Unlock the power of…” | Concrete, task-oriented copy (see §4.5–4.6) |
| Mystery-meat icon-only action buttons | Verb + object label, or icon with accessible name for truly familiar utilities |
| “Smart”/“AI” feature names for basic CRUD | Direct descriptive names a project manager would use |
| Overlong empty-state paragraphs | One heading, one short explanation if needed, one relevant next action |

**Design test:** if removing a visual element has no meaningful effect on comprehension, state, or next action, remove it. The UI should look believable with real project data, incomplete records, and long contractor names.

### 1.3 Navigation is part of the visual system

Do not create one enormous sidebar of every feature. Use two scopes:

- **Company scope:** Overview, Projects, Reports, Documents, People, Templates, Settings.
- **Project scope:** Overview, Budget & WBS, Schedule, Daily reports, Approvals, Documents, Team, Settings.

Display a company switcher and clearly identify the current project. Permissions determine available navigation. Do not show irrelevant pages just to fill the sidebar. Never leave stale project data visible after switching companies.

**Navigation contract:** at `>=1200 px`, use a persistent sidebar for the current scope. Project scope replaces the company menu and includes `Back to projects`. At `768–1199 px`, use the collapsed rail or drawer according to available space; below `768 px`, use a labeled navigation drawer. The Mini App uses the three destinations in §6.9. Do not duplicate project navigation in both sidebar and horizontal tabs; §6.3 shows the horizontal alternative. Project Settings remains available to permitted roles in either layout. Use links and `aria-current="page"` for routes; reserve ARIA tabs for in-page tab panels.

**Scope changes:** resolve unsaved edits before switching; cancel or ignore previous requests, clear visible old-scope data, and key caches/drafts by authenticated user + company + project + relevant versions/filters. Render destination data only after its authorization succeeds. Clear private caches on sign-out. Hiding navigation is never authorization.

---

## 2. Theme system: Light + Dark from day one

### 2.1 Theme policy

- `system`, `light`, and `dark` are all supported. Default is `system` on first visit unless user preference exists.
- A visible theme control lives in the user menu and Appearance settings. Persist explicit user choice; do not reset it on navigation.
- No white flashes on dark page load. Resolve effective theme before paint where possible.
- CSS semantic variables are the source of truth. Components **must not use ad hoc hex colors**.
- Both themes require separate design reviews, not CSS inversion. Charts, diagrams, tables, overlays, export preview chrome, and SVGs must honor theme.
- Documents for print/export use an explicit **print theme** independent from the application's dark theme. White paper remains white in print previews.
- Telegram Mini App follows the host color scheme in `system`; an explicit in-app light/dark preference applies inside the app. Synchronize supported host chrome colors and check contrast. If host colors fail contrast, use the product semantic surface. See §6.12.

### 2.2 Canonical palette

Values below are canonical tokens; future refinements require updating the palette **and** screenshot baselines. Brand accent is *olive*, not the default color of everything.

**Palette direction — Basalt / Olive:** warm off-white canvas, graphite text, restrained olive action color, and subtly olive-tinted neutral surfaces. Dark layers become progressively lighter so panels remain distinct. Positive states use teal-green, warnings amber, and errors muted red; olive remains reserved for actions/selection. Labels and icons remain required because hue differences alone do not establish meaning.

**References:** [Radix Colors — composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) informs the pairing of tinted neutrals with an accent and separate semantic colors. [IBM Carbon — color](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) informs neutral surface hierarchy and light/dark layering. The values below are a custom palette inspired by those principles, not copied Radix scales or an official Carbon theme. References checked 2026-10-25.

| Semantic token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#F7F7F2` | `#171A15` | App canvas |
| `--surface` | `#FFFFFF` | `#20251D` | Table, panel, dialogs |
| `--surface-raised` | `#FAFAF6` | `#292F25` | Secondary panel/popover |
| `--surface-hover` | `#EEF0E8` | `#333B2D` | Row hover and mild highlight |
| `--text` | `#252922` | `#F0F2E9` | Primary copy |
| `--text-muted` | `#5B6255` | `#B6BFA9` | Secondary copy, labels |
| `--border` | `#D6DACF` | `#49533F` | Decorative separators; not sole control boundary |
| `--control-border` | `#727B68` | `#8B967C` | Inputs and essential boundaries |
| `--primary` | `#52612F` | `#C4D394` | Primary action and selection accent |
| `--on-primary` | `#FFFFFF` | `#202719` | Button text on primary |
| `--focus` | `#52612F` | `#C4D394` | Keyboard focus ring |
| `--positive` | `#176B50` | `#66D4AE` | Positive semantic text/icon |
| `--warning` | `#89520A` | `#EEC577` | Review/warning text/icon |
| `--negative` | `#AC3445` | `#F79BA8` | Critical/error text/icon |
| `--primary-hover` | `#445126` | `#D3DFAE` | Primary action hover |
| `--primary-active` | `#37421F` | `#B4C47F` | Primary action pressed |
| `--selection-bg` | `#E8EDD9` | `#354127` | Selected item background; pair with visible marker |
| `--disabled-bg` | `#EEF0E8` | `#333B2D` | Inactive control background |
| `--disabled-text` | `#5B6255` | `#B6BFA9` | Readable inactive label; no opacity reduction |
| `--on-negative` | `#FFFFFF` | `#202719` | Text on filled danger action |
| `--positive-bg` | `#E7F3EC` | `#1D392F` | Positive status background |
| `--warning-bg` | `#FFF2DB` | `#3D321F` | Warning status background |
| `--negative-bg` | `#FBEAEC` | `#42282D` | Error status background |

Do not use `--primary` for positive states. Brand color means *action/selection*, not *approved*. Explicit labels and icons accompany semantic colors. Use the specified foreground/background pairs for status fills; never derive arbitrary component-local tints or reduce label opacity. An `Approve report` action can use the primary action style; its resulting `Approved` status uses positive semantics. Danger actions use `--negative` / `--on-negative`, explicit verbs, and consequence text.

Chart aliases: `--chart-planned: var(--text-muted)` (dashed line, square markers), `--chart-actual: var(--primary)` (solid line, round markers), and `--chart-grid: var(--border)` (decorative only). Axis labels use `--text-muted`; meaningful reference lines need labels and validated contrast. Separate plan/actual by line style as well as color.

**Contrast baseline (calculated, rounded):**

- Light: primary text on canvas ≈ **13.8:1**; muted text on canvas ≈ **5.9:1**; white on primary button ≈ **6.8:1**.
- Dark: primary text on canvas ≈ **15.6:1**; muted text on panel ≈ **8.2:1**; dark text on primary button ≈ **9.6:1**.
- Across the four standard backgrounds (`--bg`, `--surface`, `--surface-raised`, `--surface-hover`), text/muted/primary/status foreground pairs are at least **5.4:1** in light and **5.6:1** in dark. Essential control borders are at least **3.8:1** light / **3.7:1** dark. These checks cover the specified opaque pairs; derived tints and rendered components still require their own contrast review.
- White text on light primary hover/pressed ≈ **8.6:1 / 10.7:1**; dark text on dark primary hover/pressed ≈ **10.9:1 / 8.2:1**. Status foregrounds on their matching status backgrounds are at least **5.4:1** light / **6.4:1** dark. Compare unrounded ratios against thresholds.
- Normal text must meet WCAG AA **4.5:1**; large text and meaningful graphical/control boundaries **3:1**. Decorative dividers need not have the same contrast as interactive input outlines.

### 2.3 Implementation contract

```css
/* apps/web/src/styles/tokens.css */
:root {
  color-scheme: light;
  --bg: #F7F7F2;
  --surface: #FFFFFF;
  --surface-raised: #FAFAF6;
  --surface-hover: #EEF0E8;
  --text: #252922;
  --text-muted: #5B6255;
  --border: #D6DACF;
  --control-border: #727B68;
  --primary: #52612F;
  --on-primary: #FFFFFF;
  --focus: #52612F;
  --positive: #176B50;
  --warning: #89520A;
  --negative: #AC3445;
  --primary-hover: #445126;
  --primary-active: #37421F;
  --selection-bg: #E8EDD9;
  --disabled-bg: #EEF0E8;
  --disabled-text: #5B6255;
  --on-negative: #FFFFFF;
  --positive-bg: #E7F3EC;
  --warning-bg: #FFF2DB;
  --negative-bg: #FBEAEC;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #171A15;
  --surface: #20251D;
  --surface-raised: #292F25;
  --surface-hover: #333B2D;
  --text: #F0F2E9;
  --text-muted: #B6BFA9;
  --border: #49533F;
  --control-border: #8B967C;
  --primary: #C4D394;
  --on-primary: #202719;
  --focus: #C4D394;
  --positive: #66D4AE;
  --warning: #EEC577;
  --negative: #F79BA8;
  --primary-hover: #D3DFAE;
  --primary-active: #B4C47F;
  --selection-bg: #354127;
  --disabled-bg: #333B2D;
  --disabled-text: #B6BFA9;
  --on-negative: #202719;
  --positive-bg: #1D392F;
  --warning-bg: #3D321F;
  --negative-bg: #42282D;
}
body { background: var(--bg); color: var(--text); }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
/* Resolve aliases on the chart so paper previews inherit their local theme. */
.chart {
  --chart-planned: var(--text-muted);
  --chart-actual: var(--primary);
  --chart-grid: var(--border);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
/* White paper in screen previews; surrounding app chrome retains its theme. */
:root .print-document {
  color-scheme: light;
  --bg: #FFFFFF;
  --surface: #FFFFFF;
  --surface-raised: #FAFAF6;
  --surface-hover: #EEF0E8;
  --text: #252922;
  --text-muted: #5B6255;
  --border: #D6DACF;
  --control-border: #727B68;
  --primary: #52612F;
  --on-primary: #FFFFFF;
  --focus: #52612F;
  --positive: #176B50;
  --warning: #89520A;
  --negative: #AC3445;
  --primary-hover: #445126;
  --primary-active: #37421F;
  --selection-bg: #E8EDD9;
  --disabled-bg: #EEF0E8;
  --disabled-text: #5B6255;
  --on-negative: #FFFFFF;
  --positive-bg: #E7F3EC;
  --warning-bg: #FFF2DB;
  --negative-bg: #FBEAEC;
  background: var(--bg);
  color: var(--text);
}
@media print {
  :root, :root[data-theme="dark"] {
    color-scheme: light;
    --bg: #FFFFFF;
    --surface: #FFFFFF;
    --surface-raised: #FAFAF6;
    --surface-hover: #EEF0E8;
    --text: #252922;
    --text-muted: #5B6255;
    --border: #D6DACF;
    --control-border: #727B68;
    --primary: #52612F;
    --on-primary: #FFFFFF;
    --focus: #52612F;
    --positive: #176B50;
    --warning: #89520A;
    --negative: #AC3445;
    --primary-hover: #445126;
    --primary-active: #37421F;
    --selection-bg: #E8EDD9;
    --disabled-bg: #EEF0E8;
    --disabled-text: #5B6255;
    --on-negative: #FFFFFF;
    --positive-bg: #E7F3EC;
    --warning-bg: #FFF2DB;
    --negative-bg: #FBEAEC;
  }
  body { background: var(--bg) !important; color: var(--text) !important; }
  [data-print-hidden] { display: none !important; }
}
```

**Implementation detail:** `data-theme` reflects the *resolved* theme (`light`/`dark`), while the saved preference may be `system`; subscribe to system changes only for `system`. The example is an initial contract, not permission to add hardcoded UI colors elsewhere. Test form controls, select options, input autofill, charts, SVGs, and scrollbars in both themes. Generate/synchronize paper overrides from the light palette; `.print-document` must include every semantic token. Charts must resolve paper colors locally, not reuse a cached dark chart. PDF/Excel generators use an explicit report style map, not the app's theme. Status must remain intelligible when background printing is disabled.

Keep focus visible against adjacent surfaces, including colored buttons; use a neutral spacer/two-color focus treatment where needed. Do not clip the ring in scroll containers. Preserve system colors/focus in forced-colors mode. Reduced motion must not break completion logic; no workflow may depend solely on an animation-end event.

### 2.4 Component interaction states

| State | Required treatment |
|---|---|
| Default | Semantic foreground/background and explicit accessible name |
| Hover | Primary uses `--primary-hover`; neutral controls use `--surface-hover`; no layout shift |
| Pressed | Primary uses `--primary-active`; neutral/danger controls add an inset foreground outline |
| Focus-visible | Separate focus outline, retaining the underlying hover/selected state |
| Selected/current | `--selection-bg` plus visible marker and the appropriate selected/checked/current attribute |
| Disabled | `--disabled-bg` + `--disabled-text`; suppress activation; explain a non-obvious prerequisite nearby |
| Busy | Retain label/width, show localized pending status, set `aria-busy`, suppress duplicate activation |
| Invalid | `--negative` boundary plus associated error text; retain the focus outline |
| Read-only | Full-contrast selectable text and a version/lock explanation, not disabled styling |

Danger controls retain their validated color pair on hover/pressed, with underline/inset-outline feedback. Native disabled controls may leave tab order; when `aria-disabled` retains focusability for an explanation, explicitly block keyboard and pointer activation. Announce loading changes politely, not every animation frame. Hover is supplementary; every action must work without it.

### 2.5 Color and motion test cases

1. Theme switch changes all surfaces without remounting forms or losing draft input.
2. On dark mode, charts remain legible and focused controls have visible outlines.
3. Print preview has white paper and suitable print ink in either UI theme.
4. System preference change updates theme only if preference is `system`.
5. Selection/approval/error information is understandable in grayscale.
6. No chart series is distinguished **only** by red/green.
7. All meaningful text and controls pass contrast checks; no opacity hack weakens copy.

---

## 3. Layout, typography, and component grammar

### 3.1 Typography

- Interface font: **IBM Plex Sans**, with system sans fallback. Use one family for navigation, headers, tables, and forms.
- Use **IBM Plex Mono** sparingly for project identifiers, document IDs, and fixed-width data diagnostics; do not switch every numeric cell to monospace.
- Tabular numbers (`font-variant-numeric: tabular-nums`) for columns and KPI values.
- Reference sizes at a 16 px root (implement typography in `rem`): a page heading uses 24/32 px, section heading 17/24 px, body 14/21 px, table data 13/19 or 14/20 px, metadata 12/17 px. Keep primary table data at least 13 px; 12 px is for secondary metadata. Mobile form entry text is at least 16 px; labels may wrap.
- Sentence case for UI labels and CTAs: **“Import budget”**, not **“IMPORT YOUR BUDGET”** or title case everywhere.
- Maximum continuous explanatory paragraph in application UI: **two short sentences**. Prefer direct labels and progressive disclosure.
- No massive display typography in authenticated screens. Dense does not mean unreadable.

### 3.2 Dimensions and rhythm

| Element | Target |
|---|---|
| Spacing scale | `4, 8, 12, 16, 20, 24, 32` px |
| App sidebar | 224 px expanded / 56 px collapsed |
| Header | 56 px |
| Desktop page gutter | 24 px, 32 px on wide screens |
| Mobile page gutter | 16 px |
| Input & toolbar height | 36–40 px minimum desktop; >=44 × 44 px mobile touch targets; toolbars wrap |
| Desktop table row | 36–40 px compact; 44 px comfortable |
| Field label / hint | 12–13 px / 12 px |
| Default border radius | 6 px control; 8 px panel; 10 px dialog |
| Elevation | Border first; one light shadow for overlays only |
| Loading transitions | 120–180 ms unless `prefers-reduced-motion` |

**Responsive decisions:** `>=1200` wide desktop with persistent sidebar, `768–1199` compact desktop/tablet, `<768` mobile-first flows. Do not take these as the only test widths: inspect at 320, 360, 390, 768, 1024, 1440 px, 200% text resizing, and 400% browser zoom from a 1280 px viewport (320 CSS px reflow). Only genuinely two-dimensional data regions may require horizontal scrolling; shell, filters, and forms must reflow. Control/row heights are minimums, not clipping constraints.

### 3.3 Component rules

**Custom product components are mandatory.** Do not use prebuilt visual UI components, page templates, or ready-made design systems (for example, shadcn/ui, MUI, Chakra, Ant Design, Bootstrap, or copied component kits). Build and own the product's buttons, inputs, dialogs, menus, tables, navigation, and other visual components in this repository; compose them from semantic platform primitives (`button`, `input`, `select`, `dialog`, table elements, links, and landmarks) and the tokens/rules in this document. Native semantic HTML is required and is not considered a prebuilt UI component. Non-visual utilities and hooks may be used when they do not impose a visual system; Lucide React remains the approved icon source. Apply this rule to web and Telegram Mini App UI, existing screens as they are changed, and all newly added screens.

- **Button:** one dominant primary CTA per task area. Primary uses olive; red is reserved for danger/error. Destructive action uses a danger treatment and contextual confirmation.
- **Input:** real label above; visible required indicators; field-specific error below; do not use placeholder as label.
- **Tabs:** for parallel views; **stepper** for a sequential import or publish workflow. Permission-filter each view and handle lost permission without revealing data. Route navigation uses links, not tab roles (§1.3).
- **Badges:** only operational states, compact text; no arbitrary badges on every card/section.
- **Table:** default for repeated structured work; right-align amounts/quantities; separate the unit from its number; frozen identifier/description columns where useful.
- **Dialog:** only for irreversible changes, short forms, and confirmation. Complex RAB editors and long workflows get pages or drawers, not nested modals.
- **Toast:** supplementary, not the sole durable acknowledgement of a business operation.
- **Chart:** contextual, explicitly labeled axes, meaningful tooltip, matching accessible data table.
- **Empty state:** intentionally designed and contextual; illustrations never hide CTA or permission explanation.
- **Icons:** Lucide React, single consistent stroke; choose meaning before decoration.

### 3.4 Visual composition constraints

- No dashboards made entirely of cards. Mix summary strip, wide data table, and a focused exception queue.
- Sidebar and content should not both be dark blocks in light mode. Use separation and typography, not colored rectangles.
- Avoid 3 nested scroll containers. For RAB tables, horizontal scroll is allowed and sticky first columns are encouraged.
- Charts should have data hierarchy; a time-series chart must not be a shapeless colored mountain.
- In tables with 10+ columns, provide column visibility and a labeled horizontal-scroll region. Persisted saved views and selected-range export are later enhancements unless included in approved scope; do not show placeholder controls.
- UI must survive 80-character project names, 14-digit currency values, missing photo, empty attachments, and 1000+ work items.
- Do not create `Card` wrappers around single-line settings or every row.

---

## 4. Content system: English UI, localized properly

### 4.1 Language contract

- **Default locale:** `en` (English user interface). Secondary locale: `id` (Bahasa Indonesia).
- Use `next-intl` with the Next.js App Router for translated UI messages, formatting, and routing where appropriate.
- UI labels, buttons, menus, placeholders, validation errors, dialogs, states, table headings, accessible names, notification messages, and document-preview chrome **must be translation keys**.
- **Never hardcode user-visible English text in JSX/TSX** even though English is the default.
- Backend sends **stable error/status codes**, typed values, and parameters. The frontend translates them. Logs and internal API field names remain English.
- User-created content (project name, company name, WBS description, report notes) is persisted as entered and is **not automatically translated**.
- Exported official report template language is set explicitly per template/publication. It does **not** change retroactively when a viewer switches UI language.
- Missing translation keys are flagged in development and fail CI; don't silently ship raw IDs as labels.

### 4.2 Directory convention

```text
apps/web/
  src/
    app/[locale]/(app)/...
    app/[locale]/(miniapp)/mini-app/...
    i18n/
      routing.ts
      request.ts
      navigation.ts
    messages/
      en/
        common.json
        navigation.json
        projects.json
        budget.json
        schedule.json
        reports.json
        approvals.json
        documents.json
        errors.json
      id/
        ...same namespaces...
    components/
      ui/
      layout/
      domain/
      illustrations/
    assets/
      illustrations/       # original SVG assets
      marks/               # logo / approved brand assets
    styles/
      tokens.css
```

Route groups do not provide URL segments; keep web and Mini App paths distinct as shown. Assemble each locale's namespace files into one messages object in `i18n/request.ts` (for example, `reports: reportsCatalog`) so `useTranslations('reports.actions')` resolves. Use explicit typed catalog loaders.

Prefer normal translation APIs (`useTranslations` for client UI; `getTranslations` in server components). Use `Intl.NumberFormat` and `Intl.DateTimeFormat` or the localization library's formatter for user-facing display only. The API supplies authoritative financial/progress values; the frontend formats them without recomputing official totals.

### 4.3 Example translation contract (do not inline in a button)

For example, the `messages/en/reports.json` catalog contains:

```json
{
  "list": {"title": "Daily reports", "empty": "No reports yet"},
  "actions": {
    "new": "New report",
    "submit": "Submit for review",
    "saveDraft": "Save draft",
    "requestChanges": "Request changes",
    "approve": "Approve report",
    "approveStage": "Approve stage"
  },
  "fields": {"workDate": "Work date", "quantity": "Quantity completed"},
  "status": {
    "draft": "Draft",
    "submitted": "Awaiting review",
    "revision_required": "Changes requested",
    "approved": "Approved",
    "rejected": "Rejected"
  }
}
```

The matching `messages/id/reports.json` catalog contains:

```json
{
  "list": {"title": "Laporan harian", "empty": "Belum ada laporan"},
  "actions": {
    "new": "Buat laporan",
    "submit": "Ajukan untuk diperiksa",
    "saveDraft": "Simpan draf",
    "requestChanges": "Minta perbaikan",
    "approve": "Setujui laporan",
    "approveStage": "Setujui tahap"
  },
  "fields": {"workDate": "Tanggal pekerjaan", "quantity": "Volume selesai"},
  "status": {
    "draft": "Draf",
    "submitted": "Menunggu pemeriksaan",
    "revision_required": "Perlu perbaikan",
    "approved": "Disetujui",
    "rejected": "Ditolak"
  }
}
```

```tsx
'use client';
import {useTranslations} from 'next-intl';

export function SubmitReportButton() {
  const t = useTranslations('reports.actions');
  return <button type="submit">{t('submit')}</button>;
}
```

```ts
// i18n/routing.ts — adapt to actual project routing decision.
import {defineRouting} from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['en', 'id'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false
});
```

**Locale selection:** an explicit localized URL wins. On a locale-neutral entry such as the sign-in landing page, redirect using an explicitly saved user choice when available, otherwise use `en`; implement saved-choice redirection in the app entry layer, not on every unprefixed English route. `localeDetection: false` prevents browser language/cookie auto-detection from changing the English-first default. The locale switcher uses localized navigation, persists the explicit choice, and preserves unsaved form values. Test first visit, saved preference, explicit URL, and locale switching separately.

All visual examples in this document show **English translations rendered in the interface**. They are never permission to hardcode that copy in components.

### 4.4 Terminology and formatting

| Domain concept | Default UI English | Indonesian catalog |
|---|---|---|
| RAB / BoQ | **Budget (RAB)** | **RAB** |
| WBS | **Work breakdown** | **Struktur pekerjaan** |
| Bobot | **Weight (%)** | **Bobot (%)** |
| Time schedule | **Schedule baseline** | **Jadwal rencana** |
| Laporan harian | **Daily report** | **Laporan harian** |
| Persetujuan | **Approvals** | **Persetujuan** |
| Realisasi | **Actual progress** | **Progres realisasi** |
| Deviasi | **Variance (pp)** | **Deviasi (pp)** |
| Minggu lalu | **Previous period** | **Periode sebelumnya** |
| Minggu ini | **Current period** | **Periode ini** |
| Kumulatif | **Cumulative** | **Kumulatif** |
| Nilai pekerjaan | **Value of work completed** | **Nilai pekerjaan selesai** |

**Distinguish** budgeted cost, value of completed work, and actual expense; do not label all three “Cost”. Use percentage points (`pp`) for actual minus planned progress. Preserve project timezone, contract units, and displayed precision. Zero is not missing: `0` is valid; em dash `—` means unavailable.

**Formatting:** `en` sample `82.04 m³`, `68.50%`; `id` sample `82,04 m³`, `68,50%`. Currency display depends on the project contract and selected locale. API authoritative decimals remain decimal-safe strings; do not compute final values in JS floating point. Preserve decimal strings through parsing/formatting; do not coerce large currency values through `Number` without a proven precision bound. Use a verified decimal-safe display path if the formatter/runtime cannot preserve the supplied precision.

Quantity inputs use a text control with `inputmode="decimal"`, a visible unit, and locale-aware parsing. Accept the active locale's decimal separator, normalize to the API decimal-string format, and reject ambiguous grouping with a specific example. Do not silently strip punctuation (`19,04` must never become `1904`). Dates without times remain date-only values; format timestamps in the explicit project timezone, not the device's implicit timezone.

### 4.5 Human copy and CTA naming

- Action labels use **verb + direct object:** `Create project`, `Import budget`, `Submit for review`, `Request changes`, `Publish report`, `Download Excel`.
- Don't use vague verbs: `Let's go`, `Continue journey`, `Get started` (unless onboarding context justifies it), `Optimize`, `Boost`, `Explore magic`.
- Label destructive actions honestly: `Delete draft`, `Reject report`, `Remove member`.
- Confirmation must name the record and consequence. No “Are you sure?” by itself.
- Page headings are nouns or clear task names: `Projects`, `Budget (RAB)`, `Approvals`, `Weekly progress report`.
- Toast copy indicates result: `Draft saved`; failure copy indicates fix: `Upload failed. Try the file again.`
- Avoid second-person praise, cheerleading, all caps, exclamation marks, decorative ellipsis, and emojis.
- No stock filler paragraphs. **UI copy budget:** headings 2–5 words, helper text ideally <=12 words, empty descriptions <=18 words, CTA 1–4 words unless a specific action needs clarity.
- For complex field help, link `How this is calculated` or a disclosure rather than placing formula paragraphs above every field.

**Examples:**

| Bad / AI-generated | Preferred English UX |
|---|---|
| “Revolutionize Your Construction Workflow” | `Projects` |
| “Embark on your project management journey” | `No projects yet` |
| “Unlock Seamless Efficiency” | `Import budget` |
| “Oops! Something went wrong!” | `Could not load reports` + `Try again` |
| “Proceed with Action” | `Approve report` |
| “Congratulations! You did it!” | `Report approved` |
| “Manage and orchestrate your team seamlessly” | `People` |

### 4.6 Validation copy is specific

For failed actions, use translation keys with named parameters:

- `errors.budget.unsupportedFormat` → `Use an .xlsx file.`
- `errors.budget.columnMissing` → `Map the {column} column before importing.`
- `errors.reports.quantityExceedsRemaining` → `Entered quantity exceeds the remaining contract quantity.`
- `errors.reports.conflict` → `This report changed. Reload it before reviewing.`
- `errors.permissions.approveDenied` → `You can't approve reports for this project.`
- `errors.network.tryAgain` → `Connection lost. Try again.` (read failures).
- `errors.network.notSent` → `You're offline. This report hasn't been sent.` (only when no submission was sent).
- `errors.network.outcomeUnknown` → `Connection lost. Checking whether your report was submitted.` (request sent, result unconfirmed).
- `errors.network.verifyUnavailable` → `Could not confirm submission. Check status before trying again.`

Messages live in catalogs, not in response handlers or shared components. Include field labels and row/column context for spreadsheet validation.

---

## 5. Iconography, illustration assets, and empty states

### 5.1 Icons, not emoji

Use **Lucide React** for functional UI icons. Icons are implementation assets, not Unicode emoji. Recommended base size: 16 px in tables and toolbar, 18–20 px in navigation and menu; stroke width consistent at roughly 1.75–2.

| Use | Icon name (Lucide) |
|---|---|
| Projects | `FolderKanban` |
| Budget (RAB) | `Table2` |
| Schedule | `CalendarRange` |
| Daily reports | `ClipboardList` |
| Approvals | `ClipboardCheck` |
| Documents | `FileText` |
| Import | `FileUp` |
| Download | `Download` |
| Search | `Search` |
| Filter | `ListFilter` |
| Settings | `Settings2` |
| Team | `UsersRound` |
| More actions | `Ellipsis` |
| Theme | `Sun`, `Moon`, `Monitor` |

Consistency rules: one meaning → one icon; mathematical signs, currency/unit symbols, and punctuation are permitted as content, not UI icon substitutes; do not put icons on every button; icons next to visible text may be `aria-hidden`; icon-only actions need `aria-label`, tooltip, and keyboard access. **Never use emoji as fallback** when an icon asset is missing. Use text until a suitable icon is available.

### 5.2 Original vector assets

Create **purpose-built SVGs**, not stock photos or AI-generated construction cartoons. The default is *no illustration* for data-dense screens. Use a small visual only when it helps orient the user on true first-use or a significant empty state.

Asset family: **technical line diagrams** using simple shapes that echo project plans, sheets, columns, check marks, and engineering lines. Keep geometry consistent and restrained; no hard hats with smiling faces, cranes in sunsets, oversized soft 3D characters, noisy texture, gradients, glossy blobs, or mascots.

| Asset / component | Trigger | Form | Primary next action |
|---|---|---|---|
| `empty-projects.svg` | A company has no projects | Stacked plan sheet / simple site blocks | `Create project` |
| `empty-budget.svg` | Project has no budget | Sheet grid with two WBS rows | `Import budget` |
| `empty-schedule.svg` | No approved baseline | Sparse timeline with checkpoints | `Set schedule` |
| `empty-reports.svg` | No reports yet | Two compact report sheets | `New report` |
| No illustration | Approval queue is empty | Quiet text: `No reports awaiting review` | **No CTA required** |
| `empty-documents.svg` | No documents yet | Empty document outline | `Generate report` (if permitted) |
| No illustration | Filters yield no results | Concise filtered-empty text | `Clear filters` |
| `state-no-access.svg` | User lacks permission | Locked grid diagram | `Return to projects` |
| `state-offline.svg` | Mini App network unavailable | Disconnected minimal link | `Try again` |

**Asset requirements:**

- Draw in vector; store editable source where possible and production SVG, e.g. `apps/web/src/assets/illustrations/`.
- Use `viewBox="0 0 240 144"` for standard landscape assets, visual artwork within ~192x112 safe area.
- Strokes 1.5–2 px; palette uses `currentColor` or theme-aware semantic CSS; no hardcoded fill that breaks dark mode.
- For decorative inline SVG: `aria-hidden="true"` and `focusable="false"`; for decorative `<img>`, `alt=""`. For explanatory inline SVG: `role="img"` and translated accessible name/description; for explanatory `<img>`, translated alt text.
- Keep SVG paths deliberate and human-edited; no embedded raster, base64, animation, external URLs, inline executable scripts, or excessive path nodes.
- Use CSS variables/currentColor when imported as React components; note `<img src>` does not inherit parent CSS variables into the external SVG. If using public SVG files, provide separate light/dark files or select CSS-safe embedded colors.
- Avoid shadows and colored backplates. Illustrations may use a very subtle fill and a single olive accent, never a rainbow.
- Limit empty-state images to ~160–220 px wide on desktop and ~120–176 px on mobile; icons smaller for inline states.

### 5.3 Reusable empty-state composition

```text
             [ original SVG, optional ]
                   No projects yet
       Create your first project to start tracking work.
                   [ Create project ]
```

Do not add a second paragraph about the platform's value. On a filtered empty state, **do not show the first-use illustration**: say `No projects match your filters` and provide `Clear filters`. On zero pending approvals, use a quiet sentence without a fake CTA.

### 5.4 Concrete SVG reference: `empty-projects.svg`

This is an example starting point for a small custom asset, not a random icon stretched to hero size. Refine by visual review; avoid copying it into every state.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 144" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
    <path d="M46 103h149" opacity=".32"/>
    <path d="M65 91V48l22-12 22 12v43H65Z"/>
    <path d="M87 36v55M65 49h44" opacity=".55"/>
    <path d="M112 91V59l22-12 30 12v32h-52Z"/>
    <path d="M134 47v44M112 59h52" opacity=".55"/>
    <path d="M72 101h102M76 109h93" opacity=".3"/>
  </g>
  <path d="M181 40h17v17h-17z" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".65"/>
  <path d="M185 49h9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>
```

The illustration intentionally works in one ink color; a future design pass can add a single semantic accent without compromising either theme. It does **not** represent a real contractor's site or claim precise engineering meaning.

---

## 6. Wireframes — real application screens

These are **annotated visual wireframes**, not production screenshots. The PDF contains ten review boards: eight desktop screens, one board with three mobile screens, and one state-pattern board. All records, quantities, amounts, identities, and dates are labeled development fixtures. Controls illustrate placement; the PDF/images do not perform operations.

### 6.0 Visual pack and implementation map

Open [WIREFRAMES.pdf](WIREFRAMES.pdf) for the complete review. In the download bundle, keep `DESIGN.md`, `WIREFRAMES.pdf`, and `wireframes/` together so relative image references render in a repository Markdown viewer.

| Screen | PDF | Main composition | Primary action | Narrow-screen behavior |
|---|---|---|---|---|
| Company overview (§6.1) | 01 | 3-metric strip, project table, review queue | Review reports | Stack metrics; use project rows with essential fields |
| Project list (§6.2) | 02 | Search/filter toolbar, table, server pagination | Create project | Wrap filters; preserve project link, status, actual |
| Project overview (§6.3) | 03 | 4 metrics, progress chart, exception queue, work rows | New daily report | One column; exception queue precedes chart |
| Budget & WBS (§6.4) | 04 | Hierarchical rows, right-aligned numbers, totals | New draft version | Read-only item details; no compressed grid editor |
| Import budget (§6.5) | 05 | Stepper, blocking error summary, row corrections | Validate again | Stacked step/status and error rows; preserve mappings |
| Schedule (§6.6) | 06 | Weekly table above the matching chart | Context-dependent; no forced CTA | Labeled table scroll region; chart and numeric alternative |
| Approval (§6.7) | 07 | Report/evidence left, stage/history/decision right | Approve report | Details first, decision last, stacked actions |
| Documents (§6.8) | 08 | Inputs left, white paper right, publication footer | Publish report | Inputs then preview; full-screen document viewer |
| Field home (§6.9) | 09, left | Project context, task action, report status list | New daily report | Native 390 px composition |
| Field form (§6.10) | 09, center | Labeled single-column fields, evidence, stacked actions | Submit for review | 44 px targets; keyboard-safe scrolling |
| Mobile approval (§6.11) | 09, right | Quantities, evidence, review note, final decision | Setujui laporan | Long translated labels remain readable |
| State details (§6.13) | 10 | Independent empty/error/conflict/access patterns | Depends on state | Preserve field values and explicit recovery path |

**Geometry:** desktop product windows are 1440 × 800 px references, with 224 px sidebar, 56 px header, 24 px content gutters, and 1168 px usable main width. The PDF page adds annotation margins outside the product. Mobile windows are 390 × 800 px references; height is not fixed in implementation. Forms scroll and reserve space for action/keyboard/safe-area insets. These drawings use a system sans fallback; production uses IBM Plex Sans as specified in §3.1.

**Fixture consistency:** the East Ring Road overview, schedule, and document preview use W5 (2–8 Feb 2026): planned 39.5%, approved actual 35.4%, variance −4.1 pp, prior actual 26.0%, current contribution 9.4 pp. The budget has five leaf items totaling IDR 1,000,000,000. Office Tower B approval/form screens use a separate item fixture: 63.00 m³ previously approved + 19.04 m³ reported = 82.04 m³ contract quantity. Never merge these fixtures into a real project or ship them as defaults.

**Implementation boundaries:** screen images show one valid composition, not permission to omit states, use literal UI strings, bypass authorization, or force a fixed pixel canvas. Translate all labels, follow API types, and use the responsive/state contracts below. The desktop reference uses project sidebar navigation; do not add duplicate project tabs. Additional controls such as compare/export appear only when implemented and permitted.

### 6.1 Desktop app shell / company overview (1440 px target)

![Company overview](wireframes/wf-01-company-overview.png)

**Visual reference:** `WIREFRAMES.pdf`, page 01.

**Rules:** overview is an exception-finding tool, not a vanity dashboard. Top summary is a plain metric strip; no colored metric cards. Avoid AI-generated greetings. `Variance` is percentage points, **not** a relative percentage. Show last-sync/cutoff context near data that requires it.

### 6.2 Project list

![Project list](wireframes/wf-02-project-list.png)

**Visual reference:** `WIREFRAMES.pdf`, page 02.

Default to table view; sorting, search and pagination should be server-compatible. Do not use hero-sized project cards. A row can navigate, but destructive actions must be explicit and not accidentally triggered by row click.

### 6.3 Project overview

![Project overview in dark theme](wireframes/wf-03-project-overview.png)

**Visual reference:** `WIREFRAMES.pdf`, page 03.

This reference uses the project sidebar (§1.3). Do not duplicate it with project tabs; on mobile use the navigation drawer.

Do not draw a fake S-curve using CSS decorations; use the same authoritative series as reports. Future actual points are absent, not zeros. Charts must preserve visible legends and accessible numeric alternatives.

### 6.4 Budget (RAB) / WBS — dense desktop table

![Budget and WBS](wireframes/wf-04-budget.png)

**Visual reference:** `WIREFRAMES.pdf`, page 04.

- Sticky first columns; numbers right-aligned with tabular digits. No red/green row fills.
- Parent/category rows are not counted again as leaf amounts in totals.
- Approved version is **immutable**, not editable with a hidden pencil icon. `New draft version` opens the revision flow; `Import budget` is available within a draft and never modifies an approved version.
- Currency heading for this fixture: `Amounts in IDR`. The five leaf rows total IDR 1,000,000,000. Category subtotals are explanatory and must not be added to leaf totals. Display precision follows contract rules; these numbers are illustrative only.
- On narrow screens, provide read-only condensed details or a dedicated entry flow; do not force editing a 12-column grid on a phone.

### 6.5 Excel budget import — wizard

![Budget import validation](wireframes/wf-05-import.png)

**Visual reference:** `WIREFRAMES.pdf`, page 05.

Errors always identify `sheet`, `row`, `column`, `reason`, and next correction. Never silently import an entire uploaded Excel workbook as approved budget. Display the canonical amounts and reconciliation results returned by the import API; an imported source amount is comparison input, not a frontend-authoritative total. Show discrepancies and require correction or a domain-authorized resolution, never silently trust a conflicting amount. Required mappings, hierarchy, units, separators, duplicate codes, formulas/cached cells, and file limits follow the import API contract. Preserve mappings after validation failure. A failed/retried save must not create an approved budget or duplicate draft. Reusable mappings are a later enhancement unless included in approved scope.

### 6.6 Schedule / S-curve

![Schedule and S-curve](wireframes/wf-06-schedule.png)

**Visual reference:** `WIREFRAMES.pdf`, page 06.

Weekly work-item cells are **percentage-point contributions to the whole project**, not the item's own completion percentage. Across the full baseline, each item row sums to its weight. `0.0` is a known zero; `—` is unavailable/not applicable. W1–W5 show only the first five weeks. The remaining planned contribution is 60.5 pp, displayed as context rather than a chart point. The full baseline ends at 100.0%; production headers expose date ranges. The other-items summary represents omitted leaf rows and is never added again to their totals.

Separate editing plan from viewing actual. Weekly boundaries derive from real dates and project timezone; do not assume 4 weeks/month. A published baseline is read-only. Use an explicit revision flow.

**Accessible fixture table (same series as the chart):**

| Series | W1 | W2 | W3 | W4 | W5 |
|---|---:|---:|---:|---:|---:|
| Plan this week (pp) | 2.0 | 4.0 | 10.5 | 12.0 | 11.0 |
| Planned cumulative (%) | 2.0 | 6.0 | 16.5 | 28.5 | 39.5 |
| Actual cumulative (%) | 1.5 | 5.8 | 14.0 | 26.0 | 35.4 |
| Variance (pp) | −0.5 | −0.2 | −2.5 | −2.5 | −4.1 |

### 6.7 Review / approval — split view

![Daily report approval](wireframes/wf-07-approval.png)

**Visual reference:** `WIREFRAMES.pdf`, page 07.

This fixture shows a final approval stage. Render final approval only after the API confirms the final state and authoritative progress; the frontend does not create ledger entries. Rejections and change requests require reasons. No optimistic “Approved” UI before server confirmation. Warn about concurrent edits (`409 Conflict`) with a real reload path that preserves unsent review comments. Send the expected record version and handle quantity/version validation errors returned at final approval; the displayed `63.00 + 19.04 = 82.04 m³` is context, not a reservation. Approval at an intermediate stage still shows `Awaiting review` and the next stage; show `Approved` only for the final state returned by the API. Use `Approve stage` for an intermediate-stage action and `Approve report` for final approval, with matching translation keys.

### 6.8 Documents — generation and print preview

![Document preview in dark theme](wireframes/wf-08-documents.png)

**Visual reference:** `WIREFRAMES.pdf`, page 08.

Print/PDF appearance is intentionally separate from dark-mode UI. Preserve the output's budget/baseline/template versions and immutable snapshot. “Financial progress” means contractual value of measured completed work, not automatically actual spending. Show an inclusive reporting end date and pass the period/timezone through the API contract. Display its resolved cutoff and timezone; do not truncate the end of a day to `23:59` or compute snapshot membership in the browser. Publication must identify the exact generated preview/snapshot and versions. If input/version selection changes, mark the preview stale and regenerate before publishing; show newer source data separately without mutating an existing snapshot. Generating, failed, draft-ready, and published states require durable status and valid actions.

### 6.9 Telegram Mini App — field home (390 px target)

![Mini App home](wireframes/wf-09-mobile-home.png)

**Visual reference:** `WIREFRAMES.pdf`, page 09.

### 6.10 Telegram Mini App — daily report form

![Daily report entry](wireframes/wf-10-mobile-form.png)

**Visual reference:** `WIREFRAMES.pdf`, page 09.

The actual form supports multiple report entries where the business flow requires it; this wireframe shows one entry for legibility. Use data from the API; quantity is not officially counted at submit time. File upload failures must preserve other fields. Disable duplicate submit and use API idempotency keys. At 360–390 px, stack `Submit for review` full-width above secondary `Save draft` when translated labels do not fit. Never shrink/truncate labels to force both into a row. Reserve content space for any sticky action area so it cannot cover the last field.

### 6.11 Mobile approval view

![Mobile approval in Indonesian](wireframes/wf-11-mobile-approval.png)

**Visual reference:** `WIREFRAMES.pdf`, page 09.

At narrow widths, stack review actions with full labels and 44 px touch targets. Keep the review context visible before approval. If approval rights are absent, replace the action row with permission text; do not display a misleading disabled primary button without explanation.

### 6.12 Telegram host and interrupted work

- Use a host adapter for Telegram `colorScheme`/`themeParams`, theme changes, viewport changes, `safeAreaInset`, and `contentSafeAreaInset`. Feature-detect capabilities; use CSS safe-area fallbacks where needed, without counting the same inset twice. Keep focused fields and actions above the keyboard/host chrome. Test real supported webviews, not just desktop emulation.
- Map host Back to app history with unsaved-change handling before leaving. Use one primary submit affordance; if a host main button is used, avoid a competing sticky submit button. Detach listeners on teardown.
- Use the authenticated session/API flow defined for the Mini App. Client identity, host theme data, and project selection do not grant access; handle session expiry and permission errors before rendering private data.
- MVP interruption handling retains in-memory field values and upload-retry state while the view is open. Distinguish `Unsaved changes`, `Saving draft`, and `Draft saved`; the last requires server acknowledgement. Warn before app-controlled navigation discards edits. Host/browser termination can lose an unsaved in-memory draft; do not promise recovery after closing.
- Durable offline drafts, background sync, and automatic submission queues are later features. Do not imply them with a success toast or silent retry. Before adding them, define account/tenant isolation, retention, purge, reconciliation, and conflict behavior.

### 6.13 Visual state patterns

![Empty, submission-uncertain, conflict, and permission states](wireframes/wf-12-states.png)

**Visual reference:** `WIREFRAMES.pdf`, page 10. These are independent patterns, not four panels for one dashboard.

- **First-use empty:** describe the missing data and show one permitted next action.
- **Submission outcome unknown:** retain entered values, show a status-check path, and block a fresh submission until reconciled.
- **Conflict:** preserve the reviewer's comment and offer latest-version review; approval stays unavailable until the conflict is resolved.
- **Permission:** show a concise explanation and safe return action; do not reveal inaccessible project details.

---

## 7. Required states and error handling

Every fetch-driven screen must account for at least these states:

| State | Behavior | Example copy key |
|---|---|---|
| Initial loading | Stable frame; small skeletons in real content regions | None; ARIA loading status |
| First-use empty | Optional custom vector, concise explanation, permission-aware action | `projects.empty.title` |
| Filtered empty | No decorative illustration; offer reset filters | `projects.filters.noMatches` |
| Partial / no baseline | Preserve verified data; explain which comparison is unavailable | `schedule.baseline.missing` |
| Awaiting approval | Show submitted volume as **pending** | `reports.status.submitted` |
| Validation failed | Inline field and table cell errors with next corrective action | `errors.validation.*` |
| Network failed | Retry read; preserve draft; no fake success | `errors.network.*` |
| Session expired (`401`) | Reauthenticate, then revalidate scope; preserve only permitted unsaved state | `errors.auth.sessionExpired` |
| Forbidden (`403`) | Don't leak company/project details; offer safe navigation | `errors.permissions.*` |
| Not found (`404`) | Explain unavailability without confirming another tenant's record exists | `errors.notFound.*` |
| Mutation outcome unknown | Check server status using the same operation identity; do not claim success/failure | `errors.network.outcomeUnknown` |
| Conflict/stale | Show reload/version difference, never overwrite silently | `errors.conflict.*` |
| Submitted/saved | Durable result screen/row, not only disappearing toast | `reports.status.*` |
| Published/archived | Read-only state and version/audit trail | `documents.status.*` (entity-specific) |

**Text cap:** an empty state should be 1 short title and at most 1 short sentence. Use one primary action if the user has permission; otherwise explain the blocker without a useless CTA. Inline validation should be terse, contextual, and actionable.

**Mutation recovery:** reuse the idempotency key for retries of one unchanged intent. Changed payloads are new intents after reconciliation. If a request may have reached the server, query authoritative status or replay through the API's idempotency contract before offering a new submission. If verification is unavailable, show `Could not confirm submission` and preserve input; never reset the form or assert it was not sent. A transport error does not imply rollback. For `409`, retain local input and offer comparison/reload. Honor server retry timing for rate limits. Approval/publication must never be automatically retried with a new operation identity.

**Uploads:** show per-file queued/uploading/failed/ready states with retry/remove actions; preserve successful uploads and other fields when one file fails. Submission eligibility follows evidence requirements from the API. Do not label a report submitted while required evidence is still unavailable.

---

## 8. Data presentation rules unique to this product

### 8.1 RAB, quantity, and money

- WBS codes and work descriptions are separate columns; hierarchy appears through indentation + expand/collapse.
- Display `contract quantity`, `approved cumulative`, `current period`, and `remaining quantity` as different concepts. Never merge them into a vague `Progress` figure.
- Every quantity has a clear unit; currency code belongs in headings/labels where appropriate.
- Rates, amounts, weighted progress, and totals come from the API; the frontend formats canonical values.
- Parent headings/subtotals never count as an additional work item.
- Difference between budgeted cost, measured work value, and actual expenses must be legible in labels and docs.
- If more precision is stored than displayed, tooltips/details may reveal exact value; rounding behavior must match approved calculation and reporting rules.
- In comparison views, use `+2.0 pp` / `−6.5 pp`, not `+2%` / `−6.5%` for differences between progress percentages.

### 8.2 Status semantics

The table below covers **daily reports**, not a shared enum for every entity. Budgets, baselines, document generation, and document publication use their own API/state-machine contracts. A ready export is not a published document, and an approved budget does not itself post a daily-report progress ledger entry.

| Internal state | English label | Meaning for user |
|---|---|---|
| `draft` | Draft | Editable by authorized author |
| `submitted` | Awaiting review | Submitted, not counted as official progress |
| `revision_required` | Changes requested | Author can amend and resubmit |
| `approved` | Approved | Final verification; ledger effect posted once |
| `rejected` | Rejected | Not counted; reason available |

Where workflow configuration has multiple stages, display the stage name and who is next, not just an ambiguous “Pending” chip. Status text is translated, machine-readable state values are not. Document `published` means its snapshot is locked; use the documents status namespace. Intermediate approval stages retain the returned workflow state rather than a frontend-invented `approved` status.

### 8.3 S-curve

- Planned vs actual lines have distinct shapes/dashes or point markers plus labels—not only color.
- Time axis is real weeks derived from the approved baseline; y-axis has a meaningful `0–100%` range unless explicitly justified otherwise.
- Show last approved actual date. Never fill future actuals with 0.
- Provide a numeric table (weekly + cumulative) and data source/version context.
- Use the same authoritative data series for dashboard, preview, Excel, and PDF, subject to snapshot cutoffs.

**Missing/late actuals:** future actual points are absent. A confirmed historical period with no newly approved work has zero incremental contribution and carries forward the cumulative value; unavailable historical data is a gap with an explanation. Do not interpolate gaps into apparently measured progress. Show reporting period and ledger cutoff to explain late approvals. Never clamp a server value to 0–100 for appearance; surface invalid data or explicitly adjust the axis when the domain permits the value.

### 8.4 Generated reports

The two MVP documents are:

1. **Weekly physical & financial progress** — previous/current/cumulative volume and value of work, weight, contract subtotal, configurable tax and sign-off.
2. **Time schedule / S-curve** — weekly plan, cumulative plan, cumulative actual, variance (`pp`), chart and print-friendly table.

Do not invent output columns from a generic billing app. Reflect the approved report template and contract terms. Published documents do not change when users switch light/dark mode or localization preferences in the browser.

---

## 9. Interaction accessibility and performance

- Keyboard operation for all controls; modal dialogs trap focus, provide a safe close action, and restore focus to the opener. Non-modal drawers do not trap focus. Provide a skip link and landmarks. Prefer native tables with disclosure buttons; adopt a treegrid only with its full keyboard model. Virtualization must preserve row context, focused items, and an accessible path to all rows.
- Every interactive control has a visible label or translated accessible name.
- WCAG 2.2 AA contrast: 4.5:1 for standard text; 3:1 for meaningful non-text graphics/control boundaries; obvious focus indicator.
- Error messages tied to form fields (`aria-describedby`, `aria-invalid`); focus moves to error summary/first invalid field when appropriate.
- Charts get semantic descriptions and accessible tabular equivalents.
- No status communicated by hue alone; do not rely on icon alone for `Approved` vs `Rejected`.
- Support 200% text resizing and 320 CSS px reflow (including 400% browser zoom from 1280 px) without cutting off core actions. Only genuinely two-dimensional regions may scroll horizontally; headers, filters, and forms still wrap.
- Pointer targets meet the WCAG 2.2 AA 24 × 24 CSS px minimum or a documented criterion exception; the product requires >=44 × 44 px for mobile/touch controls. A 16 px icon sits in a larger hit area.
- Sticky regions must not entirely obscure keyboard focus; aim to keep the full control visible. Check focus after validation, row expansion, filtering, and pagination.
- Tooltips must be keyboard accessible, dismissible, and usable on hover/focus; critical task instructions should not exist only in tooltips.
- Do not auto-focus dangerous actions. Provide review/confirmation for irreversible transitions; a review screen naming the record, consequence, and explicit final action can satisfy this without an extra generic modal.
- Loading placeholders should not cause large layout shifts or expose fake values.
- Server pagination/filtering for long project/report lists; WBS tables need tuned rendering for thousands of work items.
- Use real optimized image thumbnails and original-file access according to permissions; avoid shipping full-size site photos in list views.
- `prefers-reduced-motion` respected; avoid motion as a status indicator.

**Source references:**

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — the checklist above is not proof of full conformance.
- [Reflow, SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — 320 CSS px and two-dimensional exceptions.
- [Target size, SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — AA minimum/exceptions; 44 px mobile targets here are a product requirement.
- [Focus not obscured, SC 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- [Lucide accessibility](https://lucide.dev/how-to/accessibility).
- [Next-intl routing configuration](https://next-intl.dev/docs/routing/configuration).
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) — host theme, viewport, and safe-area integration.

References checked 2026-10-25. Match implementation details to pinned dependency versions.

---

## 10. Frontend conventions and human naming

### 10.1 Product names and routes

Use recognizable, stable nouns. Avoid brand-sounding feature names or agent-generated metaphors.

| Good | Reject |
|---|---|
| `projects`, `budget`, `schedule`, `daily-reports`, `approvals`, `documents` | `command-center`, `growth-engine`, `magic-dashboard`, `insights-hub` |
| `New daily report` | `Smart reporting experience` |
| `Import budget` | `Seamless data ingestion` |
| `Review report` | `Action center experience` |
| `Approve report` | `Confirm success action` |

**Files/components:** `BudgetTable.tsx`, `ProjectSwitcher.tsx`, `ReportApprovalPanel.tsx`, `EmptyProjectsIllustration.tsx`, `QuantityCell.tsx`, `LocaleSwitcher.tsx`, `ThemeSwitcher.tsx`. Avoid `BeautifulCard.tsx`, `FancyPanel.tsx`, `MagicButton.tsx`, `AIWidget.tsx`, `ComponentFinal2.tsx`.

**Design tokens:** semantic names (`--surface`, `--text-muted`, `--primary`); no raw palette names sprinkled through components (`--orange-500` is not enough context), and no `bg-[#...]` in domain JSX.

**Translations:** keys describe meaning, not position or vague count: `reports.actions.submit`, not `button3`, `submitText`, or `heroSubtitle`.

### 10.2 Suggested frontend layering

```text
apps/web/src/
  app/[locale]/...
  components/
    ui/                 # minimal primitives (buttons, inputs, dialogs, table base)
    layout/             # shell, breadcrumbs, company switcher, project tabs
    data-table/         # sorting, sizing, sticky columns, pagination
    domain/
      projects/
      budget/
      schedule/
      reports/
      approvals/
      documents/
      telegram/
    illustrations/      # SVG React wrappers only
  assets/illustrations/ # original SVG source
  hooks/                # UI behavior only
  i18n/                 # routing + request + navigation
  messages/en/          # translation catalogs
  messages/id/
  lib/api/              # typed API client
  lib/format/           # locale number/date formatting, no final accounting
  lib/permissions/      # UX hints only; server enforces access
  styles/tokens.css
```

Prefer composable, boring components over abstractions that only save 3 lines. Consume authoritative business state and monetary values from the API; keep only presentation and interaction state locally. Use domain names as defined by PRD and API contract.

---

## 11. AI coding agent operating rules (mandatory)

**Do not treat this section as a UI generation prompt. These are persistent review rules.**

### Before touching frontend code

1. Read this document and the feature's PRD/task/acceptance criteria.
2. Check corresponding API types, permissions, status machine, and calculations. Do not make up response objects to fill the mockup.
3. Inventory existing project-owned components, token usage, i18n namespaces, SVG assets, and screenshots before adding new abstractions; reuse or extend project-owned components rather than introducing a prebuilt visual component library.
4. Draw/inspect a low-fidelity wireframe for changes that alter layout or user flow.
5. Check whether the proposed component is redundant with an existing project-owned table, list, or primitive.

### While implementing

1. Use **semantic theme tokens**; implement and test both themes immediately.
2. Use **semantic translation keys** with English default messages and matching `id` translations; do not commit visible hardcoded JSX strings.
3. Use recognizable **human labels** and **verb + object** CTA copy; follow copy limits above.
4. Use **Lucide icons** only for actionable/meaningful icons. No emoji or Unicode symbol substitutes for icons.
5. For illustration states, use existing original SVG asset or add one following §5; don't pull stock illustrations/remote placeholder artwork.
6. Use **real API contracts**; if backend is not implemented, isolate fixtures in dev/test-only modules and label preview environments unmistakably.
7. Keep UI concise. A 10-row table is better than ten giant cards for numeric records.
8. Implement empty, filtered empty, pending, error, permission, conflict, and loading variants for every data-driven feature.
9. Preserve accessibility, responsive behavior, and keyboard operation.
10. Never mutate state optimistically for approval/publish until the API confirms the operation.

### Anti-slop skill compatibility

If the repository contains an `anti-ai-slop` / UI-quality `SKILL.md`, read and apply it **in addition to** this document; never assume it exists or claim it has been run without reading it. The **built-in quality rubric here remains mandatory** even when a separate skill is unavailable. If a skill's visual suggestion conflicts with security, i18n, accessibility, business correctness, or this design contract, those product constraints win.

**Visual review rubric (score 0/1 each; all 10 checks must pass):**

- [ ] Layout is task-first, not a decorative template.
- [ ] Clear hierarchy; no excessive cards, pills, or shadows.
- [ ] Light and dark are both deliberate and readable.
- [ ] Data density fits construction work and wide tables.
- [ ] Human labels and concise copy; no marketing filler.
- [ ] UI text comes from i18n, English default, Indonesian available.
- [ ] No emoji; icons consistent; custom vector empties when justified.
- [ ] Correct empty/error/loading/permissions and approval states.
- [ ] Real API data, correct units, period, precision and snapshot context.
- [ ] Mobile + keyboard + focus + contrast are usable.

**Hard blockers (a score cannot waive these):** wrong tenant/project data, false progress numbers, unverified approval shown as approved, hardcoded UI copy, dark mode broken, fake working CTA, inaccessible primary action.

### After implementing

- Capture/check representative screenshots at desktop **1440 px** and mobile **390 px** in **both** light and dark, for **both** English and Indonesian (8 combinations). Verify 320/360/768/1024 px breakpoints and zoom separately; screenshots alone do not verify keyboard/accessibility.
- Check a long project name, a large currency value, 1000-row table behavior, no-baseline state, no-permission state, and long Indonesian labels.
- Test keyboard through toolbar/forms/dialogs; verify visible focus and screen reader labels for icon-only controls.
- Run translation completeness validation (`en` / `id` key parity), lint/type-check, and appropriate automated tests.
- Compare result to §6 wireframe and report genuine deviations. Do not claim UI QA passed without performing it.
- If design rules changed, update this document, related component guidelines, and snapshots in the **same PR**. Rule synchronization is not permission for autonomous architecture changes.

---

## 12. Design review checklist / merge gate

Before a frontend PR is accepted, the reviewer must answer **yes** to each:

- [ ] The screen has a clear job-to-be-done and visually prioritizes it.
- [ ] The page looks like operational construction software, not a generic startup theme.
- [ ] Theme is functional in light/dark/system and initial paint is correct.
- [ ] All user-facing UI strings and accessible names use i18n, with English and Indonesian catalogs.
- [ ] Buttons and navigation are human-readable; no hype, emoji, fake actions, or vague CTAs.
- [ ] Icons are functional/consistent and original SVG assets are used sparingly for empty states.
- [ ] Product UI is built from project-owned visual components; no third-party visual component kit or prebuilt page template is present. Semantic HTML primitives are styled with repository-owned design tokens.
- [ ] No filler card, decorative gradient, oversized hero, or unjustified illustration.
- [ ] Data values are accurately scoped to tenant/project/period/budget version and approved status.
- [ ] RAB/schedule/report tables are readable with keyboard, sticky structure, and sensible density.
- [ ] Submit/approve/publish transitions reflect server truth and handle retries/conflicts.
- [ ] Empty/loading/error/permission/partial data states have concise copy and valid actions.
- [ ] Mobile field workflow works at 360–390 px and Telegram Mini App safe area.
- [ ] Charts label their units and provide accessible numeric alternatives.
- [ ] Contrast, focus, resizing and reduced-motion behavior tested.
- [ ] Screenshots for both themes, both locales, and two primary sizes reviewed; 320 CSS px reflow, 200% text resizing, and keyboard behavior verified separately.

**If any mandatory line fails: change the implementation, not the acceptance criterion.**

---

## 13. Evolution beyond MVP without visual drift

New modules (inventory, actual expenses, subscription billing, client portals, offline drafts, enterprise permissions) must reuse the primitives and semantics above. Add navigation only after defining the user's job, required permissions, data source, empty/error states, i18n keys, and mobile treatment. A new feature is not a reason to create a new color palette, illustration style, typography scale, or generic card system.

### Change control

1. Proposed change includes reason, affected roles, wireframe, light/dark variants, copy keys, and screenshots or prototypes.
2. Review impact on tables, mobile, exports, accessibility, and existing business states.
3. Update `DESIGN.md` version and document semantic token changes; migrate affected components coherently.
4. Capture and approve new visual baselines for both locales/themes.
5. Update the AI-agent rule references and provider adapters through the repository's existing sync process.

**Do not automatically redesign existing pages based on a new visual trend or an AI agent's taste.** Consistency is a product feature.

---

## 14. Non-negotiable decisions (summary)

- **English-first UI**, translated through `next-intl`, with Indonesian support; **zero hardcoded visible JSX copy**.
- **Light, dark, system** themes from initial implementation, using the **Basalt / Olive** token system.
- **No emojis**; **Lucide icons** for controls; **original theme-aware SVGs** for intentional empty states.
- **Custom product-owned UI components only**; no prebuilt visual component libraries or page templates. Semantic HTML elements are the accessible foundation and must use repository-owned styles/tokens.
- **No AI slop**: no template gradients, repetitive giant cards, stock characters, vague CTA text, or filler paragraphs.
- **Data-first tables** for RAB/WBS, schedule, reports, approvals and exports.
- **Short, human, task-based English labels**; native locale formatting; no misleading calculations.
- **Consume authoritative API results** for calculations, permissions, approval, and export snapshots.
- **Full state coverage** and visual QA across widths, locales, and themes.

## 15. Revision record

### 2.2.0 — 2026-10-25

- Add ten annotated PDF boards covering eight desktop screens, three mobile screens, and four state details; embed per-screen image references in §6.
- Add a screen index, responsive composition rules, shared fixture context, and accessible schedule data.
- Scope the document explicitly to frontend implementation and API consumption; remove backend architecture/database/stack dependencies.
- Render and inspect the visual boards; validate embedded-image paths, document structure, and fixture arithmetic. These are design references, not tested production UI or working controls.

### 2.1.0 — 2026-10-25

- Replace Basalt / Clay with Basalt / Olive; document Radix/Carbon references, synchronize light/dark tokens, add interaction/status colors, and recalculate contrast.
- Complete paper-preview/print overrides and local chart token resolution under dark mode.
- Resolve navigation duplication, route-group ambiguity, `layout` directory naming, locale selection, and contradictory empty-state guidance.
- Clarify decimal-safe input/display, independent fixtures, RAB totals, schedule zeros/units, and import reconciliation.
- Define intermediate/final approval feedback, uncertain mutation outcomes, publication cutoffs/snapshots, Telegram host integration, and MVP interruption limits.
- Strengthen keyboard/reflow/target/focus requirements and align the review rubric with the mandatory merge gate.

**Validation scope:** document structure, palette/CSS parity, specified contrast pairs, and example arithmetic were checked. Application code, companion domain specifications, API implementation, and production screens were not supplied; this revision does not certify them or change their authority. Implementation must still pass §11–12.

*End of DESIGN.md — UX-SYS-001 v2.2.0.*
