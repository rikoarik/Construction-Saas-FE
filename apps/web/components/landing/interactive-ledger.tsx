"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle,
  Clock,
  Layers,
  LineChart,
  Send,
  Smartphone,
  Table as TableIcon,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

type ProjectType = "building" | "infrastructure";
type ViewMode = "wbs" | "scurve" | "mobile";

interface WbsItem {
  code: string;
  desc: string;
  unit: string;
  contractQty: number;
  unitPrice: number;
  cumulativeQty: number;
  progressPct: number;
  weight: number;
  status: "approved" | "verified" | "pending_review";
  entryId: string;
  supervisor: string;
  foreman: string;
  timestamp: string;
}

interface ScurvePoint {
  week: number;
  planned: number;
  actual: number;
  deviation: number;
}

const BUILDING_ITEMS: WbsItem[] = [
  {
    code: "1.01.01",
    desc: "Bored Pile Foundation Ø800 mm K-350",
    unit: "m",
    contractQty: 4800,
    unitPrice: 1450000,
    cumulativeQty: 4800,
    progressPct: 100,
    weight: 8.42,
    status: "approved",
    entryId: "TX-2026-0812-BP",
    supervisor: "Eng. Hendra Kurniawan",
    foreman: "Mandor Sugeng",
    timestamp: "2026-10-18 16:30 WIB",
  },
  {
    code: "1.02.03",
    desc: "Pile Cap & Tie Beam Reinforced Concrete fc 35 MPa",
    unit: "m³",
    contractQty: 1240,
    unitPrice: 2280000,
    cumulativeQty: 1240,
    progressPct: 100,
    weight: 6.24,
    status: "approved",
    entryId: "TX-2026-0904-PC",
    supervisor: "Eng. Hendra Kurniawan",
    foreman: "Mandor Sugeng",
    timestamp: "2026-10-20 17:15 WIB",
  },
  {
    code: "1.03.02",
    desc: "Floor Slab & Structural Beam 4th Floor fc 30 MPa",
    unit: "m³",
    contractQty: 820,
    unitPrice: 2150000,
    cumulativeQty: 680.6,
    progressPct: 83.0,
    weight: 4.88,
    status: "verified",
    entryId: "TX-2026-1022-SL4",
    supervisor: "Eng. Irfan Maulana",
    foreman: "Mandor Slamet Riadi",
    timestamp: "2026-10-24 14:10 WIB",
  },
  {
    code: "1.04.01",
    desc: "Structural Columns 5th & 6th Floors fc 40 MPa",
    unit: "m³",
    contractQty: 450,
    unitPrice: 2650000,
    cumulativeQty: 198,
    progressPct: 44.0,
    weight: 2.76,
    status: "pending_review",
    entryId: "TX-2026-1025-COL5",
    supervisor: "Eng. Irfan Maulana",
    foreman: "Mandor Slamet Riadi",
    timestamp: "2026-10-25 11:45 WIB",
  },
  {
    code: "2.01.02",
    desc: "Autoclaved Aerated Concrete Masonry Wall 2nd Fl",
    unit: "m²",
    contractQty: 3600,
    unitPrice: 185000,
    cumulativeQty: 1440,
    progressPct: 40.0,
    weight: 1.25,
    status: "verified",
    entryId: "TX-2026-1023-AAC2",
    supervisor: "Eng. Hendra Kurniawan",
    foreman: "Mandor Kasman",
    timestamp: "2026-10-23 15:40 WIB",
  },
];

const INFRASTRUCTURE_ITEMS: WbsItem[] = [
  {
    code: "02.01",
    desc: "Common Earth Excavation & Disposal offsite",
    unit: "m³",
    contractQty: 42500,
    unitPrice: 58000,
    cumulativeQty: 42500,
    progressPct: 100,
    weight: 7.15,
    status: "approved",
    entryId: "TX-2026-0715-EXC",
    supervisor: "Eng. Agus Wijaya",
    foreman: "Mandor Danu Prasetyo",
    timestamp: "2026-09-12 18:00 WIB",
  },
  {
    code: "03.01",
    desc: "Aggregate Subbase Course Class B (20 cm thick)",
    unit: "m³",
    contractQty: 18200,
    unitPrice: 320000,
    cumulativeQty: 16380,
    progressPct: 90.0,
    weight: 14.82,
    status: "approved",
    entryId: "TX-2026-0928-AGB",
    supervisor: "Eng. Agus Wijaya",
    foreman: "Mandor Danu Prasetyo",
    timestamp: "2026-10-14 17:20 WIB",
  },
  {
    code: "03.02",
    desc: "Crushed Stone Base Course Class A (15 cm thick)",
    unit: "m³",
    contractQty: 13600,
    unitPrice: 390000,
    cumulativeQty: 8840,
    progressPct: 65.0,
    weight: 13.56,
    status: "verified",
    entryId: "TX-2026-1021-AGA",
    supervisor: "Eng. Agus Wijaya",
    foreman: "Mandor Danu Prasetyo",
    timestamp: "2026-10-22 16:50 WIB",
  },
  {
    code: "04.01",
    desc: "Asphalt Concrete Wearing Course (AC-WC) 4 cm",
    unit: "ton",
    contractQty: 7850,
    unitPrice: 1180000,
    cumulativeQty: 2355,
    progressPct: 30.0,
    weight: 18.24,
    status: "pending_review",
    entryId: "TX-2026-1025-ACWC",
    supervisor: "Eng. Agus Wijaya",
    foreman: "Mandor Rahmat",
    timestamp: "2026-10-25 09:30 WIB",
  },
  {
    code: "05.02",
    desc: "Reinforced Concrete U-Ditch 80x80 cm & Cover",
    unit: "m",
    contractQty: 4800,
    unitPrice: 860000,
    cumulativeQty: 3600,
    progressPct: 75.0,
    weight: 9.68,
    status: "verified",
    entryId: "TX-2026-1024-UDT",
    supervisor: "Eng. Agus Wijaya",
    foreman: "Mandor Rahmat",
    timestamp: "2026-10-24 15:10 WIB",
  },
];

const BUILDING_SCURVE: ScurvePoint[] = [
  { week: 1, planned: 2.1, actual: 2.2, deviation: 0.1 },
  { week: 2, planned: 5.8, actual: 6.1, deviation: 0.3 },
  { week: 3, planned: 11.4, actual: 11.2, deviation: -0.2 },
  { week: 4, planned: 18.6, actual: 17.9, deviation: -0.7 },
  { week: 5, planned: 26.5, actual: 25.1, deviation: -1.4 },
  { week: 6, planned: 35.8, actual: 34.2, deviation: -1.6 },
  { week: 7, planned: 45.4, actual: 44.1, deviation: -1.3 },
  { week: 8, planned: 55.0, actual: 54.2, deviation: -0.8 },
  { week: 9, planned: 64.2, actual: 63.8, deviation: -0.4 },
  { week: 10, planned: 72.8, actual: 72.5, deviation: -0.3 },
];

const INFRASTRUCTURE_SCURVE: ScurvePoint[] = [
  { week: 1, planned: 3.5, actual: 3.8, deviation: 0.3 },
  { week: 2, planned: 8.2, actual: 8.0, deviation: -0.2 },
  { week: 3, planned: 15.6, actual: 14.8, deviation: -0.8 },
  { week: 4, planned: 24.1, actual: 22.3, deviation: -1.8 },
  { week: 5, planned: 34.0, actual: 32.5, deviation: -1.5 },
  { week: 6, planned: 44.8, actual: 44.0, deviation: -0.8 },
  { week: 7, planned: 56.2, actual: 55.9, deviation: -0.3 },
  { week: 8, planned: 67.5, actual: 67.8, deviation: 0.3 },
];

export function InteractiveLedger() {
  const t = useTranslations("landing.interactive");
  const [projectType, setProjectType] = useState<ProjectType>("building");
  const [viewMode, setViewMode] = useState<ViewMode>("wbs");
  const [selectedItem, setSelectedItem] = useState<WbsItem | null>(null);
  const [simulatedSubmitted, setSimulatedSubmitted] = useState(false);

  const items = projectType === "building" ? BUILDING_ITEMS : INFRASTRUCTURE_ITEMS;
  const scurveData = projectType === "building" ? BUILDING_SCURVE : INFRASTRUCTURE_SCURVE;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section id="interactive-ledger" className="landing-section ledger-section" aria-labelledby="ledger-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="ledger-heading" className="section-title">
            {t("title")}
          </h2>
          <p className="section-description">{t("description")}</p>
        </div>

        {/* Workspace Controls Box */}
        <div className="ledger-workbench">
          {/* Top Bar: Project Switcher & View Switcher */}
          <div className="ledger-workbench__toolbar">
            <div className="typology-tabs" role="tablist" aria-label="Project Typology Selection">
              <button
                type="button"
                role="tab"
                aria-selected={projectType === "building"}
                className={`typology-tab ${projectType === "building" ? "typology-tab--active" : ""}`}
                onClick={() => {
                  setProjectType("building");
                  setSelectedItem(null);
                }}
              >
                <Layers size={15} aria-hidden="true" />
                <span>{t("buildingTab")}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={projectType === "infrastructure"}
                className={`typology-tab ${projectType === "infrastructure" ? "typology-tab--active" : ""}`}
                onClick={() => {
                  setProjectType("infrastructure");
                  setSelectedItem(null);
                }}
              >
                <Layers size={15} aria-hidden="true" />
                <span>{t("infrastructureTab")}</span>
              </button>
            </div>

            <div className="view-mode-tabs" role="tablist" aria-label="Inspection View Modes">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "wbs"}
                className={`view-tab ${viewMode === "wbs" ? "view-tab--active" : ""}`}
                onClick={() => setViewMode("wbs")}
              >
                <TableIcon size={14} aria-hidden="true" />
                <span>{t("viewWbs")}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "scurve"}
                className={`view-tab ${viewMode === "scurve" ? "view-tab--active" : ""}`}
                onClick={() => setViewMode("scurve")}
              >
                <LineChart size={14} aria-hidden="true" />
                <span>{t("viewScurve")}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "mobile"}
                className={`view-tab ${viewMode === "mobile" ? "view-tab--active" : ""}`}
                onClick={() => setViewMode("mobile")}
              >
                <Smartphone size={14} aria-hidden="true" />
                <span>{t("viewMobile")}</span>
              </button>
            </div>
          </div>

          {/* Workbench Body */}
          <div className="ledger-workbench__content">
            {/* VIEW 1: WBS TABLE */}
            {viewMode === "wbs" && (
              <div className="wbs-view">
                <div className="table-responsive" tabIndex={0} role="region" aria-label="WBS and Physical Progress Table">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th scope="col">{t("itemCode")}</th>
                        <th scope="col">{t("itemDescription")}</th>
                        <th scope="col">{t("itemUnit")}</th>
                        <th scope="col" className="text-right">{t("contractQty")}</th>
                        <th scope="col" className="text-right">{t("unitPrice")}</th>
                        <th scope="col" className="text-right">{t("cumulativeQty")}</th>
                        <th scope="col" className="text-right">{t("progressPct")}</th>
                        <th scope="col" className="text-right">{t("weight")}</th>
                        <th scope="col">{t("status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.code}
                          className={`ledger-row ${selectedItem?.code === item.code ? "ledger-row--selected" : ""}`}
                          onClick={() => setSelectedItem(item)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedItem(item);
                            }
                          }}
                        >
                          <td className="font-mono">{item.code}</td>
                          <td className="ledger-desc">{item.desc}</td>
                          <td>{item.unit}</td>
                          <td className="text-right tabular-nums">{formatNumber(item.contractQty)}</td>
                          <td className="text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-right tabular-nums font-semibold">{formatNumber(item.cumulativeQty)}</td>
                          <td className="text-right tabular-nums">
                            <span className="progress-badge">{item.progressPct.toFixed(1)}%</span>
                          </td>
                          <td className="text-right tabular-nums text-muted">{item.weight.toFixed(2)}%</td>
                          <td>
                            <span className={`status-pill status-pill--${item.status}`}>
                              {item.status === "approved" && <Check size={12} aria-hidden="true" />}
                              {item.status === "verified" && <CheckCircle size={12} aria-hidden="true" />}
                              {item.status === "pending_review" && <Clock size={12} aria-hidden="true" />}
                              <span>{item.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ledger-workbench__footer">
                  <span className="inspector-tip">{t("inspectorNotice")}</span>
                </div>
              </div>
            )}

            {/* VIEW 2: S-CURVE CHART & TABLE */}
            {viewMode === "scurve" && (
              <div className="scurve-view">
                <div className="scurve-chart-container" role="img" aria-label="S-Curve Planned vs Actual Cumulative Progress Chart">
                  <svg className="scurve-svg" viewBox="0 0 760 260" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="730" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50" y1="80" x2="730" y2="80" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50" y1="140" x2="730" y2="140" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50" y1="200" x2="730" y2="200" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Y-Axis labels */}
                    <text x="40" y="24" textAnchor="end" className="chart-label">100%</text>
                    <text x="40" y="84" textAnchor="end" className="chart-label">75%</text>
                    <text x="40" y="144" textAnchor="end" className="chart-label">50%</text>
                    <text x="40" y="204" textAnchor="end" className="chart-label">25%</text>

                    {/* Planned line (dashed text-muted with square markers) */}
                    <polyline
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="2.5"
                      strokeDasharray="5,4"
                      points={scurveData
                        .map((d, i) => {
                          const x = 70 + i * (640 / (scurveData.length - 1));
                          const y = 240 - (d.planned / 100) * 220;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {scurveData.map((d, i) => {
                      const x = 70 + i * (640 / (scurveData.length - 1));
                      const y = 240 - (d.planned / 100) * 220;
                      return (
                        <rect
                          key={`plan-${d.week}`}
                          x={x - 3.5}
                          y={y - 3.5}
                          width="7"
                          height="7"
                          fill="var(--surface)"
                          stroke="var(--text-muted)"
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* Actual line (solid olive with circular markers) */}
                    <polyline
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      points={scurveData
                        .map((d, i) => {
                          const x = 70 + i * (640 / (scurveData.length - 1));
                          const y = 240 - (d.actual / 100) * 220;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {scurveData.map((d, i) => {
                      const x = 70 + i * (640 / (scurveData.length - 1));
                      const y = 240 - (d.actual / 100) * 220;
                      return (
                        <circle
                          key={`act-${d.week}`}
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill="var(--primary)"
                          stroke="var(--surface)"
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* X-Axis week labels */}
                    {scurveData.map((d, i) => {
                      const x = 70 + i * (640 / (scurveData.length - 1));
                      return (
                        <text key={`lbl-${d.week}`} x={x} y="255" textAnchor="middle" className="chart-label">
                          W{d.week}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                <div className="scurve-legend">
                  <div className="legend-item">
                    <span className="legend-marker legend-marker--plan" aria-hidden="true" />
                    <span>Planned Baseline (Time Schedule)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-marker legend-marker--actual" aria-hidden="true" />
                    <span>Actual Verified Physical Ledger</span>
                  </div>
                  <div className="legend-stat">
                    <span>Current Deviation:</span>
                    <strong className={scurveData[scurveData.length - 1].deviation >= 0 ? "text-positive" : "text-warning"}>
                      {scurveData[scurveData.length - 1].deviation >= 0 ? "+" : ""}
                      {scurveData[scurveData.length - 1].deviation.toFixed(2)} pp
                    </strong>
                  </div>
                </div>

                {/* Accessible Data Table representation */}
                <div className="table-responsive">
                  <table className="ledger-table ledger-table--compact">
                    <thead>
                      <tr>
                        <th scope="col">{t("scurveWeek")}</th>
                        <th scope="col" className="text-right">{t("scurvePlanned")}</th>
                        <th scope="col" className="text-right">{t("scurveActual")}</th>
                        <th scope="col" className="text-right">{t("scurveDeviation")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scurveData.map((row) => (
                        <tr key={row.week}>
                          <td>Week {row.week}</td>
                          <td className="text-right tabular-nums">{row.planned.toFixed(1)}%</td>
                          <td className="text-right tabular-nums font-semibold">{row.actual.toFixed(1)}%</td>
                          <td className="text-right tabular-nums font-mono">
                            <span className={row.deviation >= 0 ? "text-positive" : "text-warning"}>
                              {row.deviation >= 0 ? "+" : ""}
                              {row.deviation.toFixed(2)} pp
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 3: TELEGRAM MINI APP SIMULATOR */}
            {viewMode === "mobile" && (
              <div className="telegram-sim-wrapper">
                <div className="phone-device" role="region" aria-label="Telegram Mini App Site Reporting Screen">
                  <div className="phone-header">
                    <div className="phone-speaker" />
                  </div>
                  <div className="phone-screen">
                    <div className="telegram-app-bar">
                      <span className="telegram-app-title">Construction SaaS · Mini App</span>
                      <span className="telegram-badge">3G Site Mode</span>
                    </div>

                    <div className="telegram-content">
                      <div className="telegram-project-badge">
                        <span>{projectType === "building" ? "Tower B · Jakarta" : "Highway STA 14+200"}</span>
                      </div>

                      <div className="telegram-card">
                        <div className="telegram-card__title">{t("mobileHeadline")}</div>
                        <div className="telegram-field">
                          <label>{t("itemDescription")}</label>
                          <div className="telegram-field__val">
                            {projectType === "building"
                              ? "1.03.02 Floor Slab Lt. 4 Concrete fc 30 MPa"
                              : "03.02 Crushed Stone Base Class A"}
                          </div>
                        </div>

                        <div className="telegram-field">
                          <label>{t("mobileMeasuredQty")}</label>
                          <div className="telegram-input-box font-mono">
                            {projectType === "building" ? "19.04 m³" : "340.00 m³"}
                          </div>
                        </div>

                        <div className="telegram-field">
                          <label>{t("mobileEvidence")}</label>
                          <div className="telegram-photo-box">
                            <div className="photo-placeholder">
                              <span>GPS: -6.2297, 106.8294</span>
                              <span>Timestamp: 14:10:02 WIB</span>
                            </div>
                          </div>
                        </div>

                        {simulatedSubmitted ? (
                          <div className="telegram-success-banner" role="status">
                            <CheckCircle size={16} aria-hidden="true" />
                            <span>{t("mobileSubmit")}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="button button--primary telegram-submit-btn"
                            onClick={() => setSimulatedSubmitted(true)}
                          >
                            <Send size={14} aria-hidden="true" />
                            <span>Submit to Site Supervisor</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="telegram-explainer">
                  <h3>Foremen Never Edit Spreadsheets on Site</h3>
                  <p>
                    Instead of asking field supervisors to open a complex spreadsheet on a dusty phone screen, they tap
                    their assigned work item in the Telegram Mini App, type the verified batch volume, snap the geotagged
                    pour photo, and press Send.
                  </p>
                  <ul className="explainer-bullets">
                    <li>
                      <Check size={15} aria-hidden="true" />
                      <span>Zero download overhead: runs natively inside Telegram on iOS & Android.</span>
                    </li>
                    <li>
                      <Check size={15} aria-hidden="true" />
                      <span>Lightweight payload: functions reliably even on unstable 3G site coverage.</span>
                    </li>
                    <li>
                      <Check size={15} aria-hidden="true" />
                      <span>Cryptographic verification: submissions are signed via Telegram initData.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row Audit Transaction Modal */}
        {selectedItem && (
          <aside
            className="audit-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-modal-title"
          >
            <div className="audit-modal-card">
              <header className="audit-modal__header">
                <div>
                  <div className="eyebrow">{selectedItem.code}</div>
                  <h3 id="audit-modal-title" className="audit-modal__title">
                    {t("auditModalTitle")}
                  </h3>
                </div>
                <button
                  type="button"
                  className="audit-modal__close"
                  onClick={() => setSelectedItem(null)}
                  aria-label={t("close")}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>

              <div className="audit-modal__body">
                <div className="audit-meta-grid">
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">{t("auditEntryId")}</span>
                    <span className="audit-meta-value font-mono">{selectedItem.entryId}</span>
                  </div>
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">{t("auditTimestamp")}</span>
                    <span className="audit-meta-value font-mono">{selectedItem.timestamp}</span>
                  </div>
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">{t("auditSupervisor")}</span>
                    <span className="audit-meta-value">{selectedItem.supervisor}</span>
                  </div>
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">{t("auditForeman")}</span>
                    <span className="audit-meta-value">{selectedItem.foreman}</span>
                  </div>
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">{t("auditVolume")}</span>
                    <span className="audit-meta-value font-semibold">
                      {formatNumber(selectedItem.cumulativeQty)} {selectedItem.unit}
                    </span>
                  </div>
                  <div className="audit-meta-item">
                    <span className="audit-meta-label">Total Contract Value</span>
                    <span className="audit-meta-value font-mono">
                      {formatCurrency(selectedItem.contractQty * selectedItem.unitPrice)}
                    </span>
                  </div>
                </div>

                <div className="audit-evidence-banner">
                  <CheckCircle size={16} aria-hidden="true" />
                  <span>{t("auditEvidenceNote")}</span>
                </div>
              </div>

              <footer className="audit-modal__footer">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setSelectedItem(null)}
                >
                  {t("close")}
                </button>
              </footer>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}