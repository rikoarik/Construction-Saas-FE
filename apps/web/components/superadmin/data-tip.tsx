"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface DataTipRow {
  label: string;
  value: string;
}

export interface DataTipContent {
  /** Primary line: the data point or record being inspected. */
  title: string;
  rows: DataTipRow[];
}

interface TipState extends DataTipContent {
  x: number;
  y: number;
}

const WIDTH = 252;
const GAP = 14;

/** Keeps the bubble inside the viewport by flipping it across the pointer. */
function place(x: number, y: number, rows: number) {
  if (typeof window === "undefined") return { left: x + GAP, top: y + GAP };
  const height = 34 + rows * 18;
  let left = x + GAP;
  if (left + WIDTH > window.innerWidth - 10) left = x - WIDTH - GAP;
  if (left < 10) left = 10;
  let top = y + GAP;
  if (top + height > window.innerHeight - 10) top = y - height - GAP;
  if (top < 10) top = 10;
  return { left, top };
}

/**
 * Pointer-driven data inspector. Lives next to the value it explains, never on
 * the card itself: hovering a chart point, a donut slice, or a table row shows
 * the numbers that do not fit in the visual.
 */
export function useDataTip() {
  const [tip, setTip] = useState<TipState | null>(null);

  const show = useCallback((event: { clientX: number; clientY: number }, content: DataTipContent) => {
    setTip({ ...content, x: event.clientX, y: event.clientY });
  }, []);

  const showAt = useCallback((x: number, y: number, content: DataTipContent) => {
    setTip({ ...content, x, y });
  }, []);

  const hide = useCallback(() => setTip(null), []);

  return { tip, show, showAt, hide };
}

export function DataTip({ tip }: { tip: TipState | null }) {
  const reduceMotion = useReducedMotion();
  const { left, top } = tip ? place(tip.x, tip.y, tip.rows.length) : { left: 0, top: 0 };

  const bubble = <AnimatePresence>
    {tip ? <motion.div
      className="sa-data-tip"
      role="tooltip"
      aria-hidden="true"
      style={{ left, top }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      <p className="sa-data-tip__title">{tip.title}</p>
      <dl className="sa-data-tip__rows">
        {tip.rows.map((row) => <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>)}
      </dl>
    </motion.div> : null}
  </AnimatePresence>;

  // Portalled to <body>: inside the card it would inherit `.sa-panel > *`
  // (position: relative, z-index: 1) and be clipped by the table scroll box, so
  // it painted under neighbouring cards instead of over them.
  return typeof document === "undefined" ? null : createPortal(bubble, document.body);
}
