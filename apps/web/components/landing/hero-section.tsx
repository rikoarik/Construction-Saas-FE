"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  MapPin,
} from "lucide-react";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { DemoProgressChart } from "./demo-progress-chart";

interface HeroSectionProps {
  onRequestPilot: () => void;
}

const traceViews = [
  { id: "source", label: "traceSource", icon: ClipboardCheck },
  { id: "evidence", label: "traceEvidence", icon: Camera },
  { id: "document", label: "traceDocument", icon: FileCheck2 },
] as const;

type TraceView = (typeof traceViews)[number]["id"];

export function HeroSection({ onRequestPilot }: HeroSectionProps) {
  const t = useTranslations("landing.hero");
  const reduceMotion = useReducedMotion();
  const [activeView, setActiveView] = useState<TraceView>("source");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectView = (view: TraceView, focusTab = false) => {
    setActiveView(view);
    if (focusTab) {
      const index = traceViews.findIndex((item) => item.id === view);
      tabRefs.current[index]?.focus({ preventScroll: true });
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % traceViews.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + traceViews.length) % traceViews.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = traceViews.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    setActiveView(traceViews[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const entrance = reduceMotion ? false : { opacity: 0, y: 18 };

  return (
    <>
      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-hero__rule" aria-hidden="true" />
        <div className="landing-container landing-hero__layout">
          <motion.div
            className="landing-hero__copy"
            initial={entrance}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-hero__badge">
              <span className="landing-hero__badge-dot" aria-hidden="true" />
              {t("badge")}
            </div>
            <h1 id="hero-heading" className="landing-hero__title">{t("title")}</h1>
            <p className="landing-hero__subtitle">{t("subtitle")}</p>
            <div className="landing-hero__actions">
              <button
                type="button"
                className="button button--primary landing-hero__cta-primary"
                onClick={onRequestPilot}
              >
                <span>{t("ctaPrimary")}</span>
                <span className="button__icon" aria-hidden="true"><ArrowRight size={16} /></span>
              </button>
              <a
                href="#source-trace"
                className="landing-hero__demo-link"
                onClick={() => selectView("source")}
              >
                <span>{t("ctaSecondary")}</span>
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="landing-hero__pilot-note">{t("pilotNote")}</p>
          </motion.div>

          <motion.div
            className="landing-hero__product"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectSummary onTrace={() => selectView("source")} />
          </motion.div>
        </div>
      </section>

      <section
        id="source-trace"
        className="source-trace landing-section"
        aria-labelledby="source-trace-heading"
        tabIndex={-1}
      >
        <div className="landing-container">
          <div className="section-intro section-intro--split source-trace__intro">
            <div>
              <div className="eyebrow">{t("traceEyebrow")}</div>
              <h2 id="source-trace-heading" className="section-title">{t("traceTitle")}</h2>
            </div>
            <p className="section-description">{t("traceDescription")}</p>
          </div>

          <p className="source-trace__context">{t("proofNote")}</p>
          <div className="source-trace__workspace">
            <div className="source-trace__tabs" role="tablist" aria-label={t("traceTabsAria")}>
              {traceViews.map((view, index) => {
                const Icon = view.icon;
                const selected = activeView === view.id;
                return (
                  <button
                    ref={(element) => { tabRefs.current[index] = element; }}
                    key={view.id}
                    id={`source-trace-tab-${view.id}`}
                    type="button"
                    role="tab"
                    className={`source-trace__tab${selected ? " is-active" : ""}`}
                    aria-selected={selected}
                    aria-controls="source-trace-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectView(view.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                  >
                    <span className="source-trace__tab-index" aria-hidden="true">0{index + 1}</span>
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>{t(view.label)}</span>
                  </button>
                );
              })}
            </div>

            <div
              id="source-trace-panel"
              className="source-trace__panel"
              role="tabpanel"
              aria-labelledby={`source-trace-tab-${activeView}`}
              tabIndex={0}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeView}
                  className="source-trace__panel-content"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeView === "source" && <SourceReport onSelect={selectView} />}
                  {activeView === "evidence" && <FieldEvidence onSelect={selectView} />}
                  {activeView === "document" && <OfficialDocument onSelect={selectView} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectSummary({ onTrace }: { onTrace: () => void }) {
  const t = useTranslations("landing.hero");

  return (
    <div className="hero-product">
      <div className="hero-product__window">
        <div className="hero-product__systembar">
          <span>{t("demoLabel")}</span>
          <span>{t("periodLabel")}</span>
        </div>
        <header className="hero-product__header">
          <div>
            <h2>{t("projectName")}</h2>
          </div>
        </header>
        <div className="hero-product__location">
          <MapPin size={13} aria-hidden="true" />{t("projectLocation")}
        </div>
        <div className="hero-product__metrics">
          <div><span>{t("plannedLabel")}</span><strong>{t("plannedValue")}</strong></div>
          <div><span>{t("actualLabel")}</span><strong>{t("actualValue")}</strong></div>
          <div><span>{t("varianceLabel")}</span><strong className="text-warning">{t("varianceValue")}</strong></div>
        </div>
        <div className="hero-chart">
          <div className="hero-chart__heading">
            <span>{t("progressChart")}</span>
            <span>{t("periodLabel")}</span>
          </div>
          <DemoProgressChart />
        </div>
        <a href="#source-trace" className="hero-product__report" onClick={onTrace} aria-label={t("openReport", { code: t("reportCode"), work: t("reportWork") })}>
          <span className="hero-product__report-icon"><Check size={17} aria-hidden="true" /></span>
          <span className="hero-product__report-details">
            <strong>{t("reportCode")} · {t("reportWork")}</strong>
            <span>{t("reportLocation")} · {t("reportQuantity")}</span>
          </span>
          <span className="hero-product__report-action">{t("sourceLink")}<ArrowUpRight size={15} aria-hidden="true" /></span>
        </a>
      </div>
    </div>
  );
}

function SourceReport({ onSelect }: { onSelect: (view: TraceView, focusTab?: boolean) => void }) {
  const t = useTranslations("landing.hero");

  return (
    <div className="source-trace__source">
      <div className="source-trace__detail-intro">
        <h3>{t("sourceSectionTitle")}</h3>
        <p>{t("sourceSectionDesc")}</p>
      </div>
      <article className="source-trace__report-record" aria-labelledby="source-report-heading">
        <header className="source-trace__record-header">
          <div>
            <span>{t("sourceReportLabel")}</span>
            <h4 id="source-report-heading">{t("reportCode")}</h4>
          </div>
          <span className="source-trace__status"><Check size={14} aria-hidden="true" />{t("reportStatus")}</span>
        </header>
        <div className="source-trace__report-fields">
          <div><strong>{t("reportWork")}</strong><span>{t("reportLocation")}</span></div>
          <strong>{t("reportQuantity")}</strong>
        </div>
        <div className="source-trace__record-checks">
          <div>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{t("sourceReviewLabel")}</span>
            <strong>{t("sourceReviewValue")}</strong>
          </div>
          <div>
            <FileCheck2 size={18} aria-hidden="true" />
            <span>{t("sourceSnapshotLabel")}</span>
            <strong>{t("sourceSnapshotValue")}</strong>
          </div>
        </div>
      </article>
      <div className="source-trace__actions">
        <button type="button" className="button button--primary" onClick={() => onSelect("evidence", true)}>
          {t("sourceEvidenceLink")}<ArrowRight size={15} aria-hidden="true" />
        </button>
        <button type="button" className="source-trace__text-action" onClick={() => onSelect("document", true)}>
          {t("sourceDocumentLink")}<ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function FieldEvidence({ onSelect }: { onSelect: (view: TraceView, focusTab?: boolean) => void }) {
  const t = useTranslations("landing.hero");

  return (
    <div className="source-trace__evidence">
      <div className="source-trace__detail-intro">
        <h3>{t("evidenceTitle")}</h3>
        <p>{t("evidenceDescription")}</p>
      </div>
      <div className="source-trace__evidence-layout">
        <figure className="source-trace__evidence-figure">
          <div className="source-trace__evidence-image">
            <Image
              src="/images/field-reporting-site.jpg"
              alt={t("evidenceImageAlt")}
              fill
              sizes="(max-width: 760px) 100vw, (max-width: 1320px) 58vw, 720px"
            />
          </div>
          <figcaption>
            <span><MapPin size={14} aria-hidden="true" />{t("evidenceLocationLabel")}</span>
            <span>{t("evidenceMeta")}</span>
          </figcaption>
        </figure>
        <div className="source-trace__evidence-notes">
          <div className="source-trace__observation">
            <span>{t("evidenceNoteLabel")}</span>
            <p>{t("evidenceNote")}</p>
            <small>{t("reportCode")} · {t("reportLocation")} · {t("reportQuantity")}</small>
          </div>
          <div className="source-trace__review-note">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{t("evidenceReview")}</span>
          </div>
        </div>
      </div>
      <div className="source-trace__actions">
        <button type="button" className="button button--primary" onClick={() => onSelect("document", true)}>
          {t("evidenceNext")}<ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function OfficialDocument({ onSelect }: { onSelect: (view: TraceView, focusTab?: boolean) => void }) {
  const t = useTranslations("landing.hero");

  return (
    <div className="source-trace__document">
      <TraceBack onClick={() => onSelect("source", true)} label={t("documentBack")} />
      <div className="source-trace__detail-intro">
        <h3>{t("documentTitle")}</h3>
        <p>{t("documentDescription")}</p>
      </div>
      <article className="source-trace__document-paper print-document" aria-label={t("documentName")}>
        <header className="source-trace__document-header">
          <div><FileText size={20} aria-hidden="true" /><span>{t("documentCompany")}</span></div>
          <span>{t("periodLabel")}</span>
        </header>
        <div className="source-trace__document-title">
          <h4>{t("documentName")}</h4>
          <p>{t("documentPeriod")}</p>
        </div>
        <div className="source-trace__document-metrics">
          <div><span>{t("plannedLabel")}</span><strong>{t("plannedValue")}</strong></div>
          <div><span>{t("actualLabel")}</span><strong>{t("actualValue")}</strong></div>
          <div><span>{t("varianceLabel")}</span><strong>{t("varianceValue")}</strong></div>
        </div>
        <div className="source-trace__document-record">
          <span>{t("reportCode")}</span>
          <strong>{t("reportWork")}</strong>
          <span>{t("reportLocation")}</span>
          <strong>{t("reportQuantity")}</strong>
        </div>
        <div className="source-trace__document-signatures">
          <span>{t("documentPrepared")}</span>
          <span>{t("documentApproved")}</span>
        </div>
        <footer className="source-trace__document-footer">
          <CheckCircle2 size={15} aria-hidden="true" />{t("documentSnapshot")}
        </footer>
      </article>
    </div>
  );
}

function TraceBack({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="source-trace__back" onClick={onClick}>
      <ArrowLeft size={15} aria-hidden="true" />{label}
    </button>
  );
}
