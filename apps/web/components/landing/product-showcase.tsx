"use client";

import { useState } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, ClipboardCheck, FileCheck2, FileSpreadsheet, Route, Send, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { DemoProgressChart } from "./demo-progress-chart";

const views = ["overview", "plan", "reports", "documents"] as const;
type View = (typeof views)[number];
type ProjectType = "building" | "infrastructure";

export function ProductShowcase() {
  const t = useTranslations("landing.explorer");
  const [view, setView] = useState<View>("overview");
  const [projectType, setProjectType] = useState<ProjectType>("infrastructure");
  const [submitted, setSubmitted] = useState(false);
  const projectKey = projectType === "building" ? "building" : "road";

  const selectProject = (type: ProjectType) => {
    setProjectType(type);
    setSubmitted(false);
  };

  return (
    <section id="product-ui" className="landing-section explorer-section" aria-labelledby="explorer-heading">
      <div className="landing-container">
        <div className="section-intro section-intro--split">
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="explorer-heading" className="section-title">{t("title")}</h2></div>
          <div><p className="section-description">{t("description")}</p><span className="demo-disclosure">{t("demoNote")}</span></div>
        </div>

        <div className="explorer-toolbar">
          <div className="explorer-typology" aria-label={t("projectTypeAria")}>
            <button type="button" aria-pressed={projectType === "infrastructure"} onClick={() => selectProject("infrastructure")}><Route size={16} aria-hidden="true" />{t("road")}</button>
            <button type="button" aria-pressed={projectType === "building"} onClick={() => selectProject("building")}><Building2 size={16} aria-hidden="true" />{t("building")}</button>
          </div>
          <span className="explorer-toolbar__meta">{t(`${projectKey}Meta`)}</span>
        </div>

        <div className="explorer-shell">
          <div className="explorer-shell__topbar">
            <span className="explorer-shell__brand"><i aria-hidden="true" />{t("productName")}</span>
            <span>{t(`${projectKey}Project`)}</span>
            <span className="explorer-shell__period">{t("period")}</span>
          </div>
          <div className="explorer-view-tabs" role="tablist" aria-label={t("viewsAria")}>
            {views.map((item, index) => (
              <button key={item} id={`explorer-tab-${item}`} type="button" role="tab" aria-selected={view === item} aria-controls={`explorer-panel-${item}`} tabIndex={view === item ? 0 : -1} onClick={() => setView(item)} onKeyDown={(event) => {
                if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const direction = event.key === "ArrowRight" ? 1 : -1;
                const next = event.key === "Home" ? views[0] : event.key === "End" ? views[views.length - 1] : views[(views.indexOf(item) + direction + views.length) % views.length];
                setView(next);
                document.getElementById(`explorer-tab-${next}`)?.focus();
              }}><span>0{index + 1}</span>{t(`${item}Tab`)}</button>
            ))}
          </div>
          <div className="explorer-content" id={`explorer-panel-${view}`} role="tabpanel" tabIndex={0} aria-labelledby={`explorer-tab-${view}`}>
            {view === "overview" && <OverviewView projectKey={projectKey} onOpenReports={() => setView("reports")} />}
            {view === "plan" && <PlanView projectKey={projectKey} />}
            {view === "reports" && <ReportsView projectKey={projectKey} submitted={submitted} onSubmit={() => setSubmitted(true)} onReset={() => setSubmitted(false)} />}
            {view === "documents" && <DocumentsView projectKey={projectKey} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewHeading({ title, description }: { title: string; description: string }) {
  return <div className="explorer-view-heading"><h3>{title}</h3><p>{description}</p></div>;
}

function OverviewView({ projectKey, onOpenReports }: { projectKey: string; onOpenReports: () => void }) {
  const t = useTranslations("landing.explorer");
  return <>
    <ViewHeading title={t("overviewTitle")} description={t("overviewDescription")} />
    <div className="explorer-metrics">
      {["planned", "actual", "variance"].map((metric) => <div key={metric}><span>{t(`${metric}Label`)}</span><strong className={metric === "variance" ? "text-warning" : undefined}>{t(projectKey === "building" ? `building${metric[0].toUpperCase()}${metric.slice(1)}Value` : `${metric}Value`)}</strong><small>{t("metricPeriod")}</small></div>)}
    </div>
    <div className="explorer-overview">
      <div className="explorer-chart">
        <div className="explorer-chart__header"><strong>{t("chartTitle")}</strong><span>{t("chartPeriod")}</span></div>
        <DemoProgressChart project={projectKey === "building" ? "building" : "road"} />
      </div>
      <div className="explorer-source-list">
        <div className="explorer-source-list__header"><span>{t("contributingReports")}</span><strong>03</strong></div>
        {[1, 2, 3].map((item) => <div className="explorer-source-list__row" key={item}><span className="explorer-source-list__code">{t(`report${item}Code`)}</span><strong>{t(`${projectKey}Report${item}`)}</strong><small>{t(`report${item}Meta`)}</small></div>)}
        <button type="button" className="explorer-report-link" onClick={onOpenReports}>{t("openReports")}<ArrowRight size={15} aria-hidden="true" /></button>
        <p>{t("contributingNote")}</p>
      </div>
    </div>
  </>;
}

function PlanView({ projectKey }: { projectKey: string }) {
  const t = useTranslations("landing.explorer");
  return <>
    <ViewHeading title={t("planTitle")} description={t("planDescription")} />
    <div className="explorer-plan-note"><FileSpreadsheet size={20} aria-hidden="true" /><div><strong>{t("importTitle")}</strong><p>{t("importDescription")}</p></div><span>{t("budgetVersion")}</span></div>
    <div className="explorer-table-wrap" tabIndex={0} role="region" aria-label={t("tableAria")}>
      <table className="explorer-table"><thead><tr><th>{t("code")}</th><th>{t("workItem")}</th><th className="text-right">{t("quantity")}</th><th className="text-right">{t("progress")}</th><th>{t("status")}</th></tr></thead>
        <tbody>{[1, 2, 3, 4].map((item) => <tr key={item}><td>{t(`${projectKey}Code${item}`)}</td><td>{t(`${projectKey}Item${item}`)}</td><td className="text-right">{t(`${projectKey}Quantity${item}`)}</td><td className="text-right">{t(`${projectKey}Progress${item}`)}</td><td><span className={item === 4 ? "explorer-status explorer-status--review" : "explorer-status"}>{item === 4 ? t("inReview") : t("approved")}</span></td></tr>)}</tbody>
      </table>
    </div>
    <div className="explorer-plan-foot"><span>{t("addendumTitle")}</span><p>{t("addendumDescription")}</p></div>
  </>;
}

function ReportsView({ projectKey, submitted, onSubmit, onReset }: { projectKey: string; submitted: boolean; onSubmit: () => void; onReset: () => void }) {
  const t = useTranslations("landing.explorer");
  return <>
    <ViewHeading title={t("reportsTitle")} description={t("reportsDescription")} />
    <div className="explorer-report-layout">
      <div className="explorer-phone" role="region" aria-label={t("phoneAria")}>
        <div className="explorer-phone__bar"><span><Smartphone size={15} aria-hidden="true" />{t("telegram")}</span><span>{t("draftSaved")}</span></div>
        <div className="explorer-phone__body">
          <div className="explorer-phone__project"><span>{t("assignedProject")}</span><strong>{t(`${projectKey}Project`)}</strong></div>
          <dl>
            <div><dt>{t("workItem")}</dt><dd>{t(`${projectKey}Item3`)}</dd></div>
            <div><dt>{t("completedQuantity")}</dt><dd className="explorer-phone__quantity">{t(`${projectKey}ReportQuantity`)}</dd></div>
            <div><dt>{t("evidence")}</dt><dd className="explorer-phone__evidence"><Check size={16} aria-hidden="true" /><span>{t("evidenceAttached")}<small>{t("evidenceMeta")}</small></span></dd></div>
          </dl>
          {submitted ? <div className="explorer-phone__success" role="status"><CheckCircle2 size={18} aria-hidden="true" /><span>{t("simulationSubmitted")}</span></div> : <button type="button" className="button button--primary" onClick={onSubmit}><Send size={15} aria-hidden="true" />{t("simulateSubmit")}</button>}
          {submitted && <button type="button" className="explorer-phone__reset" onClick={onReset}>{t("resetDemo")}</button>}
        </div>
      </div>
      <div className="explorer-report-copy">
        <span className="eyebrow">{t("fieldEyebrow")}</span>
        <h3>{t("fieldTitle")}</h3>
        <p>{t("fieldDescription")}</p>
        <ol>{[1, 2, 3].map((item) => <li key={item}><span>0{item}</span><div><strong>{t(`fieldStep${item}Title`)}</strong><p>{t(`fieldStep${item}Description`)}</p></div></li>)}</ol>
        <span className="explorer-simulation-note"><ClipboardCheck size={15} aria-hidden="true" />{t("simulationNote")}</span>
      </div>
    </div>
  </>;
}

function DocumentsView({ projectKey }: { projectKey: string }) {
  const t = useTranslations("landing.explorer");
  return <>
    <ViewHeading title={t("documentsTitle")} description={t("documentsDescription")} />
    <div className="explorer-document-layout">
      <div className="explorer-document-context"><FileCheck2 size={24} aria-hidden="true" /><h3>{t("documentContextTitle")}</h3><p>{t("documentContextDescription")}</p><dl><div><dt>{t("documentStatusLabel")}</dt><dd>{t("published")}</dd></div><div><dt>{t("documentSourceLabel")}</dt><dd>{t("documentSourceValue")}</dd></div><div><dt>{t("documentRevisionLabel")}</dt><dd>{t("documentRevisionValue")}</dd></div></dl></div>
      <article className="print-document explorer-paper" aria-label={t("paperAria")}>
        <header><span>{t("company")}</span><FileCheck2 size={18} aria-hidden="true" /></header>
        <h3>{t("paperTitle")}</h3><p>{t(`${projectKey}Project`)} · {t("paperPeriod")}</p>
        <div className="explorer-paper__metrics"><span>{t("plannedLabel")}<strong>{t(projectKey === "building" ? "buildingPlannedValue" : "plannedValue")}</strong></span><span>{t("actualLabel")}<strong>{t(projectKey === "building" ? "buildingActualValue" : "actualValue")}</strong></span><span>{t("varianceLabel")}<strong>{t(projectKey === "building" ? "buildingVarianceValue" : "varianceValue")}</strong></span></div>
        <div className="explorer-paper__table"><div><span>{t("workItem")}</span><span>{t("quantity")}</span><span>{t("status")}</span></div>{[1, 2, 3].map((item) => <div key={item}><span>{t(`${projectKey}Item${item}`)}</span><span>{t(`${projectKey}Quantity${item}`)}</span><span>{t("approved")}</span></div>)}</div>
        <footer><span>{t("paperPrepared")}</span><span>{t("paperApproved")}</span></footer>
      </article>
    </div>
  </>;
}
