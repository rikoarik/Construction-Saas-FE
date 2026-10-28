"use client";

import { useEffect } from "react";
import Script from "next/script";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: Element) => { destroy: () => void } };
  }
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScrollcraftRuntime() {
  // ScrollCraft only owns the integrity ledger's one-time row entrances.
  // All spatial choreography, drawing strokes and the measurement rail belong to GSAP.
  useEffect(() => {
    let instance: { destroy: () => void } | undefined;
    const mount = () => {
      const root = document.querySelector(".blueprint-layout");
      if (root && window.ScrollCraft && !instance) instance = window.ScrollCraft.mount(root);
    };
    window.addEventListener("scrollcraft:ready", mount);
    mount();
    return () => {
      window.removeEventListener("scrollcraft:ready", mount);
      instance?.destroy();
    };
  }, []);

  useGSAP(() => {
    const root = document.querySelector<HTMLElement>(".blueprint-layout");
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 1024px) and (min-height: 800px)" }, (context) => {
      if (!context.conditions?.motion) return;
      const wide = context.conditions.wide === true;
      const hero = root.querySelector<HTMLElement>(".blueprint-hero");
      if (hero) {
        const heroTimeline = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 } });
        const photo = hero.querySelector(".blueprint-hero__photo img");
        const survey = hero.querySelector(".blueprint-hero__survey");
        const ledger = hero.querySelector(".blueprint-hero__ledger");
        const copy = hero.querySelector(".blueprint-hero__copy");
        if (photo) heroTimeline.to(photo, { scale: 1.18, yPercent: 10, ease: "none" }, 0);
        if (survey) heroTimeline.to(survey, { yPercent: -65, opacity: 0, ease: "none" }, 0);
        if (ledger) heroTimeline.to(ledger, { yPercent: -36, ease: "none" }, 0);
        if (copy) heroTimeline.to(copy, { yPercent: -15, ease: "none" }, 0);
      }

      const reality = root.querySelector<HTMLElement>(".reality-section");
      if (reality) {
        const rows = gsap.utils.toArray<HTMLElement>(reality.querySelectorAll(".reality-comparison__row"));
        gsap.timeline({ scrollTrigger: { trigger: reality, start: "top 80%", end: "bottom 30%", scrub: 0.6 } })
          .fromTo(rows.map((row) => row.querySelector(".reality-comparison__solution")),
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", stagger: 0.22, duration: 0.58, ease: "none" }, 0)
          .fromTo(rows.map((row) => row.querySelector(".reality-comparison__problem")),
            { xPercent: 0 }, { xPercent: -4, stagger: 0.22, duration: 0.58, ease: "none" }, 0);
      }

      const xray = root.querySelector<HTMLElement>(".blueprint-xray");
      if (xray) {
        const desk = xray.querySelector<HTMLElement>(".blueprint-xray__desk");
        const paths = gsap.utils.toArray<SVGPathElement>(xray.querySelectorAll(".blueprint-xray__guides path:not([stroke-dasharray])"));
        const lines = paths.map((path) => ({ path, length: path.getTotalLength() }));
        const sweep = xray.querySelector(".blueprint-xray__sweep");
        const grid = xray.querySelector(".blueprint-xray__grid");
        const canvas = xray.querySelector<HTMLElement>(".blueprint-xray__canvas");
        const drawingSheet = xray.querySelector(".blueprint-xray__svg");
        const xrayEntrance = gsap.timeline({ scrollTrigger: { trigger: xray, start: "top 82%", end: "top 25%", scrub: 0.7 } });
        if (grid) xrayEntrance.fromTo(grid, { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
        if (drawingSheet) xrayEntrance.fromTo(drawingSheet, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none" }, 0);
        // Pin and drawing share one trigger so their start, end and refresh stay in sync.
        const pinDesk = Boolean(wide && desk && desk.getBoundingClientRect().height <= window.innerHeight * 0.82);
        const drawing = gsap.timeline({ scrollTrigger: {
          trigger: pinDesk && desk ? desk : xray,
          start: pinDesk ? "top 12%" : "top 70%",
          end: pinDesk ? () => `+=${Math.round(window.innerHeight * 1.35)}` : "bottom 35%",
          pin: pinDesk && desk ? desk : false,
          anticipatePin: 1,
          scrub: 0.55,
        } });
        lines.forEach(({ path, length }, index) => {
          drawing.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, ease: "none", duration: 0.7 }, index * 0.1);
        });
        if (sweep && canvas) {
          drawing.fromTo(sweep, { x: 0, opacity: 0 }, { x: () => Math.max(0, canvas.clientWidth - 4), opacity: 1, ease: "none", duration: 0.8, immediateRender: false }, 0.12);
        }
      }

      const curve = root.querySelector<HTMLElement>(".blueprint-curve");
      if (curve) {
        const figure = curve.querySelector(".blueprint-curve__figure");
        const planned = curve.querySelector<SVGPolylineElement>(".chart-planned");
        const actual = curve.querySelector<SVGPolylineElement>(".chart-actual");
        const timeline = gsap.timeline({ scrollTrigger: { trigger: curve, start: "top 80%", end: "bottom 35%", scrub: 0.7 } });
        if (figure) timeline.fromTo(figure, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", duration: 0.4 }, 0);
        for (const [index, line] of [planned, actual].entries()) {
          if (!line) continue;
          timeline.fromTo(line, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", duration: 0.7 }, index === 0 ? 0.2 : 0.35);
        }
      }
    });

    const rail = root.querySelector<HTMLElement>(".blueprint-measure");
    if (rail) {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => rail.style.setProperty("--blueprint-progress", String(self.progress)),
        onRefresh: (self) => rail.style.setProperty("--blueprint-progress", String(self.progress)),
      });
    }

    let active = true;
    const refresh = () => { if (active) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => {
      active = false;
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  });

  return <Script src="/scrollcraft.js" strategy="afterInteractive" onReady={() => { window.dispatchEvent(new Event("scrollcraft:ready")); }} />;
}
