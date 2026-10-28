# Platform (superadmin) area rules

Scope: `components/superadmin/*`. Read this before adding or restyling anything in
the platform dashboard.

## Styling

- **Scoped custom CSS only.** All layout and visual rules live in
  `components/superadmin/superadmin.css`. Do not add Tailwind utility classes or
  inline `style` for anything beyond runtime-computed values (chart geometry,
  donut gradient, meter width, pointer position).
- **Tokens, not literals.** Use the `--sa-*` custom properties declared on
  `.sa-shell`. Add a new token when a value repeats three times. Every token needs
  a `:root[data-theme="dark"]` counterpart, except pure structure (radius, gap).
- The shell remaps the app-level semantic tokens (`--surface`, `--text`,
  `--border`, `--primary`, …) onto `--sa-*` so shared primitives inherit the
  platform palette without a second theme system.
- **Borders only where they carry meaning.** Cards use a 1px `--sa-border` hairline;
  internal sections separate with spacing and surface, not rules. Table rows are
  the one exception.
- Radius: cards `--sa-radius-card` (16px), controls `--sa-radius-control` (12px),
  pills `--sa-radius-pill`. Do not mix in `app/globals.css` radii inside this area.
- Spacing comes from `--sa-gap` (12px). Page rhythm is `sa-main` gap → `sa-grid`
  gap → panel padding. Never hardcode a one-off margin between cards.

## Controls

- **Never use a native `<select>` or `<input type="date">` in this area.** They
  cannot be themed and break the pill styling. Use `Dropdown` from
  `components/ui/primitives.tsx`; add a variant to it instead of inlining a
  bespoke menu.
- The command-palette field is **bespoke, not a primitive `input`**. It carries
  no border, background, radius, or focus ring of its own; the surrounding
  `.sa-palette__field` owns the focus state (bottom border turns `--sa-blue`).
  It is excluded from the shell-wide `input:focus-visible` rule by name, so do
  not "fix" a box around it by scoping with `.sa-shell` — remove it at the
  source rule instead.
- `Dropdown` keeps listbox semantics by hand: `aria-haspopup="listbox"`,
  `aria-expanded`, roving focus with Arrow/Home/End, Escape closes and restores
  focus, outside `pointerdown` dismisses, and re-selecting the current value does
  not fire `onChange`.
- The resolved period is a pill in its own wrapper (`sa-heading__meta` →
  `sa-period`), placed left of the range control on the same row. Never leave it
  as bare text, and never stack the two controls vertically.
- Both header filters read as one cluster and share the `--sa-filter-*` metrics
  declared on `.sa-heading__filter` (height, radius, inline padding, font size).
  Change the chip and the picker together — a 27px chip next to a 38px picker is
  the bug this token set exists to prevent.
- A single control may own two jobs only when the affordance is obvious; the
  brand mark doubles as the collapse/expand toggle on desktop and reverts to a
  plain `<span>` logo below 1024px.

### Search

- The topbar search is a **command palette**, not a list filter. `⌘K` / `Ctrl K`
  opens it, and it indexes every addressable thing: the current page, companies,
  processes, theme, language, and range. Keep adding entries when a new
  destination or command appears — a palette that only knows two things is worse
  than no palette.
- It lives in `command-palette.tsx`. Matching lives in `rankEntries` (pure, unit
  tested): exact → prefix → word start → substring → subsequence, with a per-group
  cap of 5 so one noisy category cannot flood the list. Sections follow the best
  match, not a fixed order, so the first row is always the top hit.
- Focus never leaves the input: navigation is `aria-activedescendant` over
  `role="option"` items. Arrow/Home/End move, Enter opens, Escape closes and
  restores the trigger, the scrim is a real `<button>` with `tabIndex={-1}`.
- A query with no match offers to filter the dashboard lists for that term
  instead of dead-ending.
- Palette-wide indexes (`usePaletteCompanies`, `usePaletteJobs`) are `enabled`
  only while the palette is open. Never hoist them into the dashboard render.

### Menus (profile, range, locale)

- Menus are controlled components: a real `<button>` trigger with
  `aria-haspopup`, `aria-expanded`, and an `AnimatePresence` panel. Do not use
  `<details>`/`<summary>` — it cannot animate, cannot return focus, and the
  marker styling differs per browser.
- Every menu: focus the first item on open, Escape closes and returns focus to
  the trigger, outside `pointerdown` dismisses, and `role="menu"` /
  `role="menuitem"` are set when the panel is a command list (`role="listbox"` /
  `role="option"` for a value picker).
- The shared `Button` renders `children` inside a `<span>`; menu rows must set
  the inner span to `display: inline-flex; align-items: center; gap` or the icon
  stacks above the label. Never fix this with a fixed height.

## Copy

- **Unavailable is not zero.** Never invent a value for a metric without a
  source. Sidebar Storage and API Request rows remain visible with empty tracks;
  show numbers and percentages only when the corresponding data is available.
  A quota bar requires both a measured value and a positive limit.

- **Empty states are one line.** Icon plus a short title (`noActivityTitle`,
  `noCompaniesTitle`, …). Do not explain *why* it is empty or *what will appear*;
  that is obvious from the panel title. Panel count badges are hidden at zero.
- **Long caveats go behind a `Hint` tooltip**, not into a visible paragraph.
  Visible prose is for the primary reading path only. Screen-reader users still
  get the full text: `Hint` wires `aria-describedby` to its bubble.
- All user-visible strings live in `components/superadmin/locale.ts` (`id` + `en`).
  `npm run check:ui-copy` fails the build on a literal string in TSX, including
  short ones like "UTC".
- Do not put copy in `title=` attributes as the only carrier of meaning; `title`
  is unreachable by keyboard and touch.

## Motion and pointer feedback

- Sidebar collapse animates `flex-basis`, `width` and `padding` over 260ms so the
  workspace reflows instead of jumping; labels fade in with `sa-label-in` when
  they return from `display: none`.
- **Nothing in the rail is simply hidden when it collapses.** The usage card
  becomes a 44px conic ring (`.sa-usage__ring`), the same shape as the status
  donut, showing the same percentage with an `aria-label`. Below 1024px the rail
  is a drawer and never 72px wide, so the card stays whole and the ring is not
  rendered.
- Pointer-tracked highlight is implemented in `use-pointer-glow.ts`: one
  delegated `pointermove` listener per shell, `requestAnimationFrame`-throttled,
  writing `--sa-mx` / `--sa-my` on the hovered `.sa-kpi` / `.sa-panel`. Do not
  attach per-card listeners.
- **Cards do not move on hover.** No lift, no scale, no shadow growth, no
  border "pop" animation on `.sa-kpi` / `.sa-panel` — the surface stays exactly
  where it is and only the border colour and the ambient glow react. Hover
  feedback belongs to the data (see *Data inspection*), not to the container.
  Transforms stay for controls that physically move: `translateX(1px)` on nav
  icons, `scale(.99…)` on `:active` presses, `sa-rise` on entry.
- Entry animation (`sa-rise`) is staggered by `:nth-child` and must stay under
  300ms with `backwards` fill so it does not block paint.
- **Every animation needs a `prefers-reduced-motion: reduce` opt-out.** The
  pointer glow is skipped at the listener level (it never runs), and the CSS block
  at the end of the stylesheet disables transforms, transitions and the highlight
  overlay. Touch devices (`hover: none`) never get hover styling.

## Accessibility

- Interactive affordances need a real control: `button`, `a`, or `summary`. A
  `<span>` with a click handler is not acceptable.
- Focus rings use `outline: 2px solid var(--sa-blue)` with a 2px offset and must
  stay visible against both themes.
- The mobile drawer is a `dialog` with `aria-modal`, a focus trap, Escape to close,
  and `inert` on the workspace behind it. The brand mark is only a button on
  desktop; below 1024px it renders as a `<span>` so the trap starts on the close
  button.
- Status is never carried by color alone: pair the dot with a text label.
- Segmented controls (theme) use one shared `layoutId` indicator that slides
  between segments, and keep `aria-pressed` on each button. Never fake the
  active state with a background on the pressed button alone — it cannot move.

## Data inspection (pointer)

- "Hover feedback" means **the value**, not the card. `data-tip.tsx` exports
  `useDataTip` + `DataTip`; a chart point, donut slice, table row, or meter row
  calls `show(event, { title, rows })` and `hide` on leave. Never add a hover lift
  or shadow to a data mark and call it interaction.
- The tip is a single `position: fixed` bubble, **portalled to `<body>`** and on
  its own top layer (`z-index: 200`, above the palette at 90). Inside a card it
  inherits `.sa-panel > *` (`position: relative`, `z-index: 1`) and gets clipped
  by the table scroll box, so it paints under the neighbouring panel — that is
  the "numpuk" bug. Never render it as a card child again.
- Because it lives outside `.sa-shell`, its colours come from root-level
  `--sa-tip-*` tokens, not the scoped `--sa-*` ones. They must stay declared on
  `:root` / `:root[data-theme="dark"]` or the bubble resolves to no background.
- **The tip surface is fully opaque.** A translucent tip is not a fix for a
  layering bug; it only lets the card underneath show through. Light is
  `#ffffff`, dark is `#16233a`.
- The tip has `pointer-events: none`, so it never steals the pointer it
  describes. Keep the width constant (`WIDTH` in `data-tip.tsx` must match
  `.sa-data-tip`'s
  `width`) or the edge test silently stops matching the layout.
- The growth chart snaps to the **nearest plotted point** and draws a guide line;
  the active dot grows and fills. It is keyboard-reachable (`tabIndex={0}`,
  ArrowLeft/ArrowRight step, blur hides) because a pointer-only readout is not a
  readout.
- The donut maps the pointer angle back to a slice via each slice's `start`/`end`
  percentage. The inner disc is a hole, not a hit target. Inspecting dims the
  ring and repaints only the hovered slice; the legend rows are hit targets too.
- Labels are reused sentence fragments (`perusahaan baru`, `total`). They are
  capitalised in CSS via `::first-letter`; do not fork a second "label" string
  just to get a capital letter.
- Respect `prefers-reduced-motion`: the tip fade, dot growth, and donut dimming
  all drop their transitions.

## Topbar alignment

Every topbar control (search trigger, locale, theme, profile) is 38px tall with
`--sa-radius-control`. A new control that is shorter or taller than its
neighbours is a bug, not a preference. Verify with
`getBoundingClientRect().height` on all four.

## Verification before handoff

Run from `apps/web`:

```
npx tsc --noEmit
npx vitest run
npm run check:ui-copy
npm run check:messages
npx eslint components/superadmin
```

Then look at it: 1440px light, 1440px dark, sidebar collapsed, and 390px mobile.
A static render harness is the fastest way to eyeball it without seeding a backend.
