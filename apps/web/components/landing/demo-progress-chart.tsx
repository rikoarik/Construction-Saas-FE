"use client";

import { useFormatter, useTranslations } from "next-intl";

// Illustrative, precomputed display fixtures; never authoritative project math.
const series = {
  road: [
    { week: 1, planned: 2, actual: 1.5, x: 24, py: 192, ay: 194 },
    { week: 2, planned: 6, actual: 5.8, x: 167, py: 176, ay: 176.8 },
    { week: 3, planned: 16.5, actual: 14, x: 310, py: 134, ay: 144 },
    { week: 4, planned: 28.5, actual: 26, x: 453, py: 86, ay: 96 },
    { week: 5, planned: 39.5, actual: 35.4, x: 596, py: 42, ay: 58.4 },
  ],
  building: [
    { week: 1, planned: 2.1, actual: 2.2, x: 24, py: 191.6, ay: 191.2 },
    { week: 2, planned: 6, actual: 5.8, x: 167, py: 176, ay: 176.8 },
    { week: 3, planned: 11.4, actual: 11.2, x: 310, py: 154.4, ay: 155.2 },
    { week: 4, planned: 19, actual: 17.6, x: 453, py: 124, ay: 129.6 },
    { week: 5, planned: 26.5, actual: 25.1, x: 596, py: 94, ay: 99.6 },
  ],
};

export function DemoProgressChart({ project = "road" }: { project?: "road" | "building" }) {
  const t = useTranslations("landing.chart");
  const format = useFormatter();
  const points = series[project];
  const number = (value: number) => format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="demo-progress-chart">
      <svg viewBox="0 0 620 230" role="img" aria-label={t(project === "building" ? "buildingAria" : "aria")}>
        {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="24" y1={y} x2="596" y2={y} className="chart-grid" />)}
        <polyline points={points.map((point) => `${point.x},${point.py}`).join(" ")} className="chart-planned" />
        <polyline points={points.map((point) => `${point.x},${point.ay}`).join(" ")} className="chart-actual" />
        {points.map((point) => <g key={point.week}>
          <circle cx={point.x} cy={point.ay} r="4" className="chart-point" />
          <text x={point.x} y="224" textAnchor="middle" className="hero-chart__label">{t("week", { week: point.week })}</text>
        </g>)}
      </svg>
      <div className="explorer-chart__legend"><span><i className="legend-line legend-line--planned" aria-hidden="true" />{t("planned")}</span><span><i className="legend-line" aria-hidden="true" />{t("actual")}</span></div>
      <details className="demo-progress-chart__data">
        <summary>{t("table")}</summary>
        <table><caption>{t(project === "building" ? "buildingAria" : "aria")}</caption><thead><tr><th>{t("weekLabel")}</th><th>{t("planned")}</th><th>{t("actual")}</th></tr></thead>
          <tbody>{points.map((point) => <tr key={point.week}><th scope="row">{t("week", { week: point.week })}</th><td>{number(point.planned)}%</td><td>{number(point.actual)}%</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}
