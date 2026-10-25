"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Check, CheckCircle2, ClipboardCheck, LineChart, Route, Send, Smartphone, Table2 } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

type ProjectType = "building" | "infrastructure";
type ViewMode = "wbs" | "scurve" | "mobile";
type DemoItem = { code: string; description: string; unit: string; quantity: number; progress: number; weight: number; status: "approved" | "pending" };
type CurvePoint = { week: number; planned: number; actual: number };

const buildingItems: DemoItem[] = [
  { code: "1.01.01", description: "Bored pile foundation Ø800 mm", unit: "m", quantity: 4800, progress: 100, weight: 8.42, status: "approved" },
  { code: "1.02.03", description: "Pile cap & tie beam concrete", unit: "m³", quantity: 1240, progress: 100, weight: 6.24, status: "approved" },
  { code: "1.03.02", description: "Fourth-floor structural slab", unit: "m³", quantity: 680.6, progress: 83, weight: 4.88, status: "approved" },
  { code: "1.04.01", description: "Structural columns, levels 5–6", unit: "m³", quantity: 198, progress: 44, weight: 2.76, status: "pending" },
];
const infrastructureItems: DemoItem[] = [
  { code: "02.01", description: "Common earth excavation", unit: "m³", quantity: 42500, progress: 100, weight: 7.15, status: "approved" },
  { code: "03.01", description: "Aggregate subbase course class B", unit: "m³", quantity: 16380, progress: 90, weight: 14.82, status: "approved" },
  { code: "03.02", description: "Crushed stone base course class A", unit: "m³", quantity: 8840, progress: 65, weight: 13.56, status: "approved" },
  { code: "04.01", description: "Asphalt concrete wearing course", unit: "ton", quantity: 2355, progress: 30, weight: 18.24, status: "pending" },
];
const buildingCurve: CurvePoint[] = [
  { week: 1, planned: 2.1, actual: 2.2 }, { week: 3, planned: 11.4, actual: 11.2 },
  { week: 5, planned: 26.5, actual: 25.1 }, { week: 7, planned: 45.4, actual: 44.1 },
  { week: 10, planned: 72.8, actual: 72.5 },
];
const infrastructureCurve: CurvePoint[] = [
  { week: 1, planned: 3.5, actual: 3.8 }, { week: 3, planned: 15.6, actual: 14.8 },
  { week: 5, planned: 34, actual: 32.5 }, { week: 8, planned: 67.5, actual: 67.8 },
];

export function InteractiveLedger() {
  const t = useTranslations("landing.interactive");
  const locale = useLocale();
  const [projectType, setProjectType] = useState<ProjectType>("building");
  const [viewMode, setViewMode] = useState<ViewMode>("wbs");
  const [submitted, setSubmitted] = useState(false);
  const items = projectType === "building" ? buildingItems : infrastructureItems;
  const curve = projectType === "building" ? buildingCurve : infrastructureCurve;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const points = (key: "planned" | "actual") => curve.map((point, index) => `${52 + index * 150},${220 - point[key] * 2.4}`).join(" ");
  const views = [{ id: "wbs" as const, icon: Table2, label: t("viewWbs") }, { id: "scurve" as const, icon: LineChart, label: t("viewScurve") }, { id: "mobile" as const, icon: Smartphone, label: t("viewMobile") }];

  return (
    <section id="interactive-ledger" className="landing-section ledger-section" aria-labelledby="ledger-heading">
      <div className="landing-container">
        <motion.div className="section-intro section-intro--split" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="ledger-heading" className="section-title">{t("title")}</h2></div>
          <div><p className="section-description">{t("description")}</p><span className="demo-disclosure">{t("demoDisclosure")}</span></div>
        </motion.div>
        <motion.div className="ledger-workbench" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
          <div className="ledger-workbench__toolbar">
            <div className="typology-tabs" aria-label={t("typologyAria")}>
              <button type="button" aria-pressed={projectType === "building"} onClick={() => { setProjectType("building"); setSubmitted(false); }}><Building2 size={15} aria-hidden="true" />{t("buildingTab")}</button>
              <button type="button" aria-pressed={projectType === "infrastructure"} onClick={() => { setProjectType("infrastructure"); setSubmitted(false); }}><Route size={15} aria-hidden="true" />{t("infrastructureTab")}</button>
            </div>
            <div className="view-mode-tabs" aria-label={t("viewModeAria")}>
              {views.map((view) => <button key={view.id} type="button" aria-pressed={viewMode === view.id} onClick={() => setViewMode(view.id)}><view.icon size={15} aria-hidden="true" /><span>{view.label}</span></button>)}
            </div>
          </div>
          <div className="ledger-workbench__content">
            {viewMode === "wbs" && <div className="table-responsive" tabIndex={0} role="region" aria-label={t("tableAria")}>
              <table className="ledger-table"><thead><tr><th>{t("itemCode")}</th><th>{t("itemDescription")}</th><th>{t("itemUnit")}</th><th className="text-right">{t("cumulativeQty")}</th><th className="text-right">{t("progressPct")}</th><th className="text-right">{t("weight")}</th><th>{t("status")}</th></tr></thead>
                <tbody>{items.map((item) => <tr key={item.code}><td className="font-mono">{item.code}</td><td>{item.description}</td><td>{item.unit}</td><td className="text-right tabular-nums">{number.format(item.quantity)}</td><td className="text-right tabular-nums">{number.format(item.progress)}%</td><td className="text-right tabular-nums">{number.format(item.weight)}%</td><td><span className={`status-label status-label--${item.status}`}>{item.status === "approved" ? <Check size={13} aria-hidden="true" /> : <span className="status-label__dot" aria-hidden="true" />}{t(item.status)}</span></td></tr>)}</tbody>
              </table>
            </div>}
            {viewMode === "scurve" && <div className="scurve-view">
              <div className="scurve-chart-container"><svg className="scurve-svg" viewBox="0 0 700 270" role="img" aria-label={t("chartAria")}>
                {[28, 76, 124, 172, 220].map((y) => <line key={y} x1="52" y1={y} x2="652" y2={y} className="chart-grid" />)}
                <polyline points={points("planned")} className="chart-planned" /><polyline points={points("actual")} className="chart-actual" />
                {curve.map((point, index) => <g key={point.week}><circle cx={52 + index * 150} cy={220 - point.actual * 2.4} r="5" className="chart-point" /><text x={52 + index * 150} y="252" textAnchor="middle" className="chart-label">W{point.week}</text></g>)}
              </svg></div>
              <div className="scurve-legend"><span><i className="legend-line legend-line--planned" aria-hidden="true" />{t("legendBaseline")}</span><span><i className="legend-line legend-line--actual" aria-hidden="true" />{t("legendActual")}</span></div>
              <div className="table-responsive"><table className="ledger-table ledger-table--compact"><thead><tr><th>{t("scurveWeek")}</th><th className="text-right">{t("scurvePlanned")}</th><th className="text-right">{t("scurveActual")}</th><th className="text-right">{t("scurveDeviation")}</th></tr></thead><tbody>{curve.map((point) => <tr key={point.week}><td>{t("weekLabel")} {point.week}</td><td className="text-right">{number.format(point.planned)}%</td><td className="text-right">{number.format(point.actual)}%</td><td className="text-right">{number.format(point.actual - point.planned)} {t("percentagePoints")}</td></tr>)}</tbody></table></div>
            </div>}
            {viewMode === "mobile" && <div className="telegram-sim-wrapper">
              <div className="phone-device" role="region" aria-label={t("telegramAria")}>
                <div className="phone-device__buttons" aria-hidden="true"><i /><i /><i /></div>
                <div className="phone-device__screen"><div className="phone-status"><span>09:41</span><div className="phone-dynamic-island" aria-hidden="true" /><div className="phone-status__icons" aria-hidden="true"><i /><i /><i /></div></div>
                  <div className="telegram-app-bar"><button type="button" aria-label={t("telegramBack")}><ArrowLeft size={16} aria-hidden="true" /></button><div><strong>{t("telegramHeader")}</strong><span>{t("telegramOnline")}</span></div><span className="telegram-app-bar__avatar"><ClipboardCheck size={14} aria-hidden="true" /></span></div>
                  <div className="telegram-content"><div className="telegram-project"><span>{t("assignedProject")}</span><strong>{projectType === "building" ? t("buildingProject") : t("infrastructureProject")}</strong></div><div className="telegram-form-heading"><span>{t("mobileHeadline")}</span><small>{t("draftSaved")}</small></div>
                    <dl><div><dt>{t("itemDescription")}</dt><dd>{items[2].description}</dd></div><div><dt>{t("mobileMeasuredQty")}</dt><dd className="telegram-quantity">{projectType === "building" ? "19.04" : "340.00"}<span>{items[2].unit}</span></dd></div><div><dt>{t("mobileEvidence")}</dt><dd className="telegram-evidence"><span className="telegram-evidence__thumb"><Check size={15} aria-hidden="true" /></span><span>{t("evidenceAttached")}<small>{t("evidenceMeta")}</small></span></dd></div></dl>
                    {submitted ? <div className="telegram-success" role="status"><CheckCircle2 size={16} aria-hidden="true" />{t("mobileSubmit")}</div> : <button type="button" className="button button--primary" onClick={() => setSubmitted(true)}><Send size={14} aria-hidden="true" />{t("telegramSubmit")}</button>}
                  </div><div className="phone-home-indicator" aria-hidden="true" />
                </div>
              </div>
              <div className="telegram-explainer"><span className="eyebrow">{t("fieldEyebrow")}</span><h3>{t("telegramCalloutTitle")}</h3><p>{t("telegramCalloutDesc")}</p><ul>{[1, 2, 3].map((item) => <li key={item}><Check size={15} aria-hidden="true" />{t(`telegramPoint${item}`)}</li>)}</ul></div>
            </div>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
