"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { usePlatformLocale } from "./locale";

export type PaletteGroup = "pages" | "companies" | "processes" | "actions";

export interface PaletteEntry {
  id: string;
  group: PaletteGroup;
  label: string;
  /** Secondary line: plan, status, resolved period, current value. */
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

const GROUP_LABEL = { pages: "palettePages", companies: "paletteCompanies", processes: "paletteProcesses", actions: "paletteActions" } as const;
const GROUP_LIMIT = 5;

/**
 * Case-insensitive match with a coarse relevance score, so a prefix hit beats a
 * loose subsequence hit the way Spotlight does. Returns null when nothing hits.
 */
export function score(label: string, term: string): number | null {
  const haystack = label.toLocaleLowerCase();
  const needle = term.toLocaleLowerCase();
  if (!needle) return 0;
  if (haystack === needle) return 100;
  if (haystack.startsWith(needle)) return 80;
  if (haystack.includes(` ${needle}`)) return 60;
  if (haystack.includes(needle)) return 40;
  let index = 0;
  for (const character of haystack) {
    if (character === needle[index]) index += 1;
    if (index === needle.length) return 10;
  }
  return null;
}

export function rankEntries(entries: PaletteEntry[], term: string): PaletteEntry[] {
  const scored = entries
    .map((entry, order) => ({ entry, order, value: score(`${entry.label} ${entry.hint ?? ""}`, term) }))
    .filter((row): row is { entry: PaletteEntry; order: number; value: number } => row.value !== null)
    .sort((a, b) => b.value - a.value || a.order - b.order);
  const counts = new Map<PaletteGroup, number>();
  return scored
    .filter(({ entry }) => {
      const used = counts.get(entry.group) ?? 0;
      if (used >= GROUP_LIMIT) return false;
      counts.set(entry.group, used + 1);
      return true;
    })
    .map(({ entry }) => entry);
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  entries: PaletteEntry[];
  /** Runs when nothing matched: narrows the dashboard lists to the typed term. */
  onFilter: (term: string) => void;
}

/**
 * Spotlight-style palette: one field over every addressable thing in the
 * platform, driven by `aria-activedescendant` so focus never leaves the input.
 */
export function CommandPalette({ open, onClose, entries, onFilter }: CommandPaletteProps) {
  const { t } = usePlatformLocale();
  const reduceMotion = useReducedMotion();
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listId = useId();

  const trimmed = term.trim();
  const results = useMemo(() => rankEntries(entries, trimmed), [entries, trimmed]);
  // Sections follow the best match, not a fixed order, so the top row is always
  // the top hit and the visual order matches the keyboard order.
  const groups = useMemo(() => {
    const sections: Array<{ group: PaletteGroup; label: string; items: PaletteEntry[] }> = [];
    for (const entry of results) {
      let section = sections.find((candidate) => candidate.group === entry.group);
      if (!section) {
        section = { group: entry.group, label: t(GROUP_LABEL[entry.group]), items: [] };
        sections.push(section);
      }
      section.items.push(entry);
    }
    return sections;
  }, [results, t]);

  // Reset on open during render, not in an effect, so the first paint already
  // shows an empty field instead of flashing the previous search.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setTerm(""); setActive(0); }
  }

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      restoreRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open, onClose]);

  const run = (entry: PaletteEntry | undefined) => {
    if (!entry) return;
    onClose();
    entry.run();
  };

  const move = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => (results.length ? (index + 1) % results.length : 0)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0)); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(Math.max(0, results.length - 1)); }
    else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) run(results[active]);
      else if (trimmed) { onClose(); onFilter(trimmed); }
    }
  };

  const empty = groups.length === 0;

  return <AnimatePresence>
    {open ? <div className="sa-palette">
      <motion.button
        type="button"
        className="sa-palette__scrim"
        aria-label={t("paletteClose")}
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
      />
      <motion.div
        className="sa-palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("paletteTitle")}
        initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onKeyDown={(event) => {
          // The input is the only tab stop; keep Tab inside the dialog so the
          // workspace behind the scrim stays unreachable.
          if (event.key !== "Tab") return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="sa-palette__field">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            className="sa-palette__input"
            type="text"
            role="combobox"
            aria-label={t("palettePlaceholder")}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `${listId}-${results[active]?.id}` : undefined}
            placeholder={t("palettePlaceholder")}
            autoComplete="off"
            spellCheck={false}
            value={term}
            onChange={(event) => { setTerm(event.target.value); setActive(0); }}
            onKeyDown={move}
          />
          <kbd className="sa-palette__esc" aria-hidden="true">{t("paletteEsc")}</kbd>
        </div>
        <div className="sa-palette__list" id={listId} role="listbox" aria-label={t("paletteTitle")} ref={listRef}>
          {groups.map((section) => <div key={section.group} role="group" aria-label={section.label} className="sa-palette__group">
            <p className="sa-palette__group-label" aria-hidden="true">{section.label}</p>
            {section.items.map((entry) => {
              const index = results.indexOf(entry);
              return <button
                key={entry.id}
                type="button"
                role="option"
                id={`${listId}-${entry.id}`}
                data-index={index}
                tabIndex={-1}
                aria-selected={index === active}
                className="sa-palette__option"
                onMouseMove={() => setActive(index)}
                onClick={() => run(entry)}
              >
                <span className="sa-palette__option-icon" aria-hidden="true">{entry.icon}</span>
                <span className="sa-palette__option-text">
                  <span className="sa-palette__option-label">{entry.label}</span>
                  {entry.hint ? <span className="sa-palette__option-hint">{entry.hint}</span> : null}
                </span>
                <CornerDownLeft size={13} aria-hidden="true" className="sa-palette__option-enter" />
              </button>;
            })}
          </div>)}
          {empty && <p className="sa-palette__empty">
            {trimmed ? t("paletteNoMatch") : t("paletteEmpty")}
            {trimmed ? <button type="button" className="sa-palette__fallback" onClick={() => { onClose(); onFilter(trimmed); }}>
              {t("paletteFilter").replace("{term}", trimmed)}
            </button> : null}
          </p>}
        </div>
        <p className="sa-palette__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t("paletteMove")}</span>
          <span><kbd>↵</kbd> {t("paletteOpenHint")}</span>
          <span><kbd>{t("paletteEsc")}</kbd> {t("paletteClose")}</span>
        </p>
      </motion.div>
    </div> : null}
  </AnimatePresence>;
}
