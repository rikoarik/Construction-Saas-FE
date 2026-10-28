"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const zones = ["foundation", "structure", "mep", "finish"] as const;
type Zone = (typeof zones)[number];

const zoneShapes: Record<Zone, { x: number; y: number; width: number; height: number }> = {
  foundation: { x: 69, y: 297, width: 432, height: 63 },
  structure: { x: 116, y: 93, width: 337, height: 204 },
  mep: { x: 318, y: 149, width: 104, height: 131 },
  finish: { x: 124, y: 102, width: 166, height: 178 },
};

export function ProductShowcase() {
  const t = useTranslations("landing.blueprint");
  const [selected, setSelected] = useState<Zone>("foundation");
  const [preview, setPreview] = useState<Zone | null>(null);
  const active = preview ?? selected;

  return (
    <section id="product-ui" className="blueprint-xray landing-section" aria-labelledby="xray-heading">
      <div className="landing-container blueprint-xray__stage">
        <div className="blueprint-xray__intro">
          <div><p className="blueprint-xray__label">{t("xrayLabel")}</p><h2 id="xray-heading">{t("xrayTitle")}</h2></div>
          <p>{t("xrayLead")}</p>
        </div>
        <div className="blueprint-xray__desk">
          <div className="blueprint-xray__drawing">
            <div className="blueprint-xray__drawing-head"><span>{t("drawingLabel")}</span><span>{t("drawingScale")}</span></div>
            <div className="blueprint-xray__canvas">
            <div className="blueprint-xray__sweep" aria-hidden="true" />
            <svg className="blueprint-xray__svg" viewBox="0 0 570 410" role="img" aria-label={t("drawingAria")}>
              <g className="blueprint-xray__grid" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth=".65" opacity=".3">
                <path d="M69 24V380 M116 24V380 M163 24V380 M210 24V380 M257 24V380 M304 24V380 M351 24V380 M398 24V380 M445 24V380 M492 24V380 M35 45H530 M35 92H530 M35 139H530 M35 186H530 M35 233H530 M35 280H530 M35 327H530 M35 374H530" />
              </g>
              <g className="blueprint-xray__guides" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M45 361H526 M69 380H501 M69 372V388 M501 372V388 M48 70V361 M38 70H56 M38 361H56" />
                <path d="M69 297H501V360H69Z M116 93H453V297H116Z M151 93V40H417V93 M151 40L116 93 M417 40L453 93" strokeWidth="2" />
                <path d="M124 102H290V280H124Z M142 120H273V263H142Z M318 149H422V280H318Z M334 165H406V263H334Z M116 196H453 M220 93V297 M318 93V297 M69 328H501" />
                <path d="M33 93H533 M33 196H533 M33 297H533 M116 23V373 M318 23V373 M453 23V373" strokeDasharray="3 7" opacity=".45" />
              </g>
              <rect {...zoneShapes[active]} className="blueprint-xray__active-shape" />
              <g className="blueprint-xray__markers" fill="currentColor"><circle cx="69" cy="297" r="3"/><circle cx="501" cy="360" r="3"/><circle cx="116" cy="93" r="3"/><circle cx="453" cy="297" r="3"/></g>
            </svg>
            <div className="blueprint-xray__hotspots" aria-label={t("zoneAria")}>
              {zones.map((zone) => <button key={zone} type="button" className={`blueprint-xray__hotspot blueprint-xray__hotspot--${zone}`} aria-label={t("selectZone", { zone: t(`${zone}Name`) })} aria-pressed={selected === zone} onPointerEnter={(event) => { if (event.pointerType === "mouse") setPreview(zone); }} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(zone)} onBlur={() => setPreview(null)} onClick={() => { setSelected(zone); setPreview(null); }}><span aria-hidden="true">{String(zones.indexOf(zone) + 1).padStart(2, "0")}</span></button>)}
            </div>
            </div>
            <div className="blueprint-xray__zone-controls" aria-label={t("zoneAria")}>
              {zones.map((zone) => <button key={zone} type="button" className={active === zone ? "is-active" : ""} aria-pressed={selected === zone} onPointerEnter={(event) => { if (event.pointerType === "mouse") setPreview(zone); }} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(zone)} onBlur={() => setPreview(null)} onClick={() => { setSelected(zone); setPreview(null); }}><span aria-hidden="true">{String(zones.indexOf(zone) + 1).padStart(2, "0")}</span>{t(`${zone}Name`)}</button>)}
            </div>
          </div>
          <div className="blueprint-xray__detail" aria-live="polite" aria-atomic="true">
            <div className="blueprint-xray__detail-top"><span>{t("detailLabel")}</span><span>{t("sampleLabel")}</span></div>
            <p className="blueprint-xray__detail-index">{t("zoneCode", { number: zones.indexOf(active) + 1 })}</p>
            <h3>{t(`${active}Name`)}</h3>
            <p className="blueprint-xray__detail-description">{t(`${active}Description`)}</p>
            <dl>
              <div><dt>{t("scopeLabel")}</dt><dd>{t(`${active}Scope`)}</dd></div>
              <div><dt>{t("recordLabel")}</dt><dd>{t(`${active}Record`)}</dd></div>
              <div><dt>{t("costLabel")}</dt><dd>{t("costUnavailable")}</dd></div>
              <div><dt>{t("durationLabel")}</dt><dd>{t("durationUnavailable")}</dd></div>
            </dl>
            <p className="blueprint-xray__disclosure">{t("xrayDisclosure")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
