"use client";

import { useEffect } from "react";

/**
 * Feeds the pointer position of the hovered card into `--sa-mx` / `--sa-my` so
 * the CSS radial highlight follows the cursor.
 *
 * One delegated listener for the whole shell, throttled to a frame, and skipped
 * entirely for touch input or reduced-motion users.
 */
export function usePointerGlow(selector = ".sa-kpi, .sa-panel") {
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
    if (!media.matches) return;
    let frame = 0;
    let card: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--sa-mx", `${x - rect.left}px`);
      card.style.setProperty("--sa-my", `${y - rect.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
      card = target;
      if (!card) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => { card = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [selector]);
}
