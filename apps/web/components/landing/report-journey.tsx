"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Camera, Check, CheckCircle2, ClipboardCheck, FileCheck2, FileText, LineChart, MapPin, Send } from "lucide-react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  { id: "field", icon: Camera },
  { id: "report", icon: ClipboardCheck },
  { id: "review", icon: CheckCircle2 },
  { id: "dashboard", icon: LineChart },
  { id: "document", icon: FileCheck2 },
] as const;

export function ReportJourney() {
  const t = useTranslations("landing.journey");
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const railRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(() => {
    if (reduceMotion) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 961px)", () => {
      const triggers = stepRefs.current.map((element, index) => element && ScrollTrigger.create({
        trigger: element,
        start: "top 54%",
        end: "bottom 46%",
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      })).filter(Boolean);
      if (railRef.current) {
        gsap.fromTo(railRef.current, { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 45%", end: "bottom 65%", scrub: .35 },
        });
      }
      return () => triggers.forEach((trigger) => trigger?.kill());
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [reduceMotion], revertOnUpdate: true });

  return (
    <section ref={sectionRef} id="report-journey" className="journey-section" aria-labelledby="journey-heading">
      <div className="landing-container">
        <div className="section-intro section-intro--split journey-intro">
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="journey-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </div>
        <div className="journey-layout">
          <div className="journey-steps">
            <span ref={railRef} className="journey-steps__progress" aria-hidden="true" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  ref={(element) => { stepRefs.current[index] = element; }}
                  key={step.id}
                  type="button"
                  className={`journey-step ${active === index ? "is-active" : ""}`}
                  aria-pressed={active === index}
                  aria-controls="journey-artifact"
                  onClick={() => setActive(index)}
                >
                  <span className="journey-step__marker"><Icon size={17} strokeWidth={1.75} aria-hidden="true" /></span>
                  <span className="journey-step__copy"><span className="journey-step__index">0{index + 1} / 05</span><strong>{t(`${step.id}Title`)}</strong><span>{t(`${step.id}Description`)}</span></span>
                  <ArrowUpRight className="journey-step__arrow" size={17} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="journey-stage">
            <div className="journey-stage__top"><span>{t("recordLabel")}</span><span>{t("recordCode")}</span></div>
            <div id="journey-artifact" className="journey-artifact" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={steps[active].id}
                  className="journey-artifact__content"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {active === 0 && <FieldArtifact />}
                  {active === 1 && <ReportArtifact />}
                  {active === 2 && <ReviewArtifact />}
                  {active === 3 && <DashboardArtifact />}
                  {active === 4 && <DocumentArtifact />}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="journey-stage__foot"><span>{t(`${steps[active].id}Caption`)}</span><span>{t("demoLabel")}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtifactHeading({ step, title, meta }: { step: string; title: string; meta: string }) {
  return <header className="journey-artifact__header"><div><span>{step}</span><h3>{title}</h3></div><small>{meta}</small></header>;
}

function FieldArtifact() {
  const t = useTranslations("landing.journey");
  return <><ArtifactHeading step={t("fieldStep")} title={t("fieldArtifactTitle")} meta={t("fieldTime")} />
    <div className="journey-field__photo"><Image src="/images/field-reporting-site.jpg" alt={t("fieldImageAlt")} fill sizes="(max-width: 960px) 90vw, 52vw" /></div>
    <div className="journey-field__meta"><span><MapPin size={14} aria-hidden="true" />{t("fieldLocation")}</span><span><Camera size={14} aria-hidden="true" />{t("fieldEvidence")}</span></div>
    <div className="journey-field__note"><span>{t("fieldNoteLabel")}</span><strong>{t("fieldNote")}</strong></div>
  </>;
}

function ReportArtifact() {
  const t = useTranslations("landing.journey");
  return <><ArtifactHeading step={t("reportStep")} title={t("reportArtifactTitle")} meta={t("reportStatus")} />
    <div className="journey-form">
      <div><span>{t("workItemLabel")}</span><strong>{t("workItem")}</strong><small>{t("workItemCode")}</small></div>
      <div className="journey-form__measure"><span>{t("quantityLabel")}</span><strong>{t("quantityValue")} <small>m³</small></strong></div>
      <div className="journey-form__evidence"><Camera size={19} aria-hidden="true" /><span><strong>{t("evidenceLabel")}</strong><small>{t("evidenceValue")}</small></span><Check size={17} aria-hidden="true" /></div>
      <div className="journey-form__note"><span>{t("noteLabel")}</span><p>{t("noteValue")}</p></div>
      <div className="journey-form__submit"><Send size={15} aria-hidden="true" />{t("submitLabel")}</div>
    </div>
  </>;
}

function ReviewArtifact() {
  const t = useTranslations("landing.journey");
  return <><ArtifactHeading step={t("reviewStep")} title={t("reviewArtifactTitle")} meta={t("reviewRevision")} />
    <div className="journey-review__summary"><span><CheckCircle2 size={24} aria-hidden="true" /></span><div><strong>{t("reviewWorkItem")}</strong><small>{t("reviewQuantity")}</small></div><b>{t("reviewVerified")}</b></div>
    <div className="journey-review__checks">{["quantity", "evidence", "location"].map((item) => <div key={item}><Check size={15} aria-hidden="true" /><span>{t(`${item}Check`)}</span><strong>{t("checkPassed")}</strong></div>)}</div>
    <div className="journey-review__audit"><span>{t("auditLabel")}</span><p>{t("auditValue")}</p><small>{t("auditMeta")}</small></div>
    <div className="journey-review__approval"><Check size={16} aria-hidden="true" />{t("approvalLabel")}</div>
  </>;
}

function DashboardArtifact() {
  const t = useTranslations("landing.journey");
  return <><ArtifactHeading step={t("dashboardStep")} title={t("dashboardArtifactTitle")} meta={t("dashboardPeriod")} />
    <div className="journey-dashboard__metrics"><div><span>{t("plannedLabel")}</span><strong>{t("plannedValue")}</strong></div><div><span>{t("actualLabel")}</span><strong>{t("actualValue")}</strong></div><div><span>{t("varianceLabel")}</span><strong>{t("varianceValue")}</strong></div></div>
    <div className="journey-dashboard__chart"><div><strong>{t("chartTitle")}</strong><span>{t("chartLegend")}</span></div><svg viewBox="0 0 560 240" role="img" aria-label={t("chartAria")}>
      {[30, 80, 130, 180, 220].map((y) => <line key={y} x1="22" x2="540" y1={y} y2={y} className="journey-chart__grid" />)}
      <polyline points="22,208 108,182 194,146 280,112 366,82 452,53 538,30" className="journey-chart__planned" />
      <polyline points="22,210 108,191 194,160 280,135 366,105 452,82 538,62" className="journey-chart__actual" />
      {[[22,210],[108,191],[194,160],[280,135],[366,105],[452,82],[538,62]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" className="journey-chart__point" />)}
    </svg></div>
    <div className="journey-dashboard__ledger"><FileText size={16} aria-hidden="true" /><span>{t("ledgerLabel")}</span><strong>+{t("quantityValue")} m³</strong><Check size={15} aria-hidden="true" /></div>
  </>;
}

function DocumentArtifact() {
  const t = useTranslations("landing.journey");
  return <><ArtifactHeading step={t("documentStep")} title={t("documentArtifactTitle")} meta={t("documentStatus")} />
    <div className="journey-document__paper">
      <div className="journey-document__brand"><span>{t("documentCompany")}</span><FileText size={20} aria-hidden="true" /></div>
      <h4>{t("documentTitle")}</h4><p>{t("documentPeriod")}</p>
      <div className="journey-document__metrics"><span>{t("plannedLabel")}<strong>{t("plannedValue")}</strong></span><span>{t("actualLabel")}<strong>{t("actualValue")}</strong></span><span>{t("varianceLabel")}<strong>{t("varianceValue")}</strong></span></div>
      <div className="journey-document__table"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <div className="journey-document__sign"><span>{t("preparedBy")}</span><span>{t("approvedBy")}</span></div>
    </div>
    <div className="journey-document__foot"><CheckCircle2 size={16} aria-hidden="true" /><span>{t("snapshotLabel")}</span><strong>W05 / V03</strong></div>
  </>;
}
