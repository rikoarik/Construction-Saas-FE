"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Activity, AlertTriangle, Building2, CircleCheck, Clock3, CreditCard, Database, FileWarning, FolderOpen, HardDrive, Mail, Plug, Search, TrendingUp, Users, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button, TableRegion } from "@/components/ui/primitives";
import type { Activities, Companies, CompanyStatus, Dashboard, Distribution, Growth, Integrations, Jobs, Storage } from "@/lib/api/platform-dashboard";
import { activityTitle, bytes, date, dateTime, jobType, number, percent, relativeTime } from "./format";
import { useCompanyCopy, usePlatformLocale } from "./locale";
import { DataTip, useDataTip } from "./data-tip";

type EmptyState = { title: string; icon?: LucideIcon };

export function WidgetState({ loading, error, empty, unavailable, onRetry, children, className = "" }: { loading?: boolean; error?: Error | null; empty?: EmptyState | false; unavailable?: string | false; onRetry?: () => void; children: ReactNode; className?: string }) {
  const { t } = usePlatformLocale();
  if (loading) return <div className={`sa-widget-state sa-widget-state--loading ${className}`} role="status" aria-label={t("loading")}><span className="sa-skeleton" /><span className="sa-skeleton" /><span className="sa-skeleton" /><span className="sr-only">{t("loading")}</span></div>;
  if (error) return <div className={`sa-widget-state ${className}`} role="alert"><AlertTriangle size={20} aria-hidden="true" /><span>{"status" in error && error.status === 403 ? t("noPermission") : t("loadError")}</span>{onRetry && !("status" in error && error.status === 401) && <Button onClick={onRetry}>{t("retry")}</Button>}</div>;
  if (unavailable) return <div className={`sa-widget-state ${className}`}><Database size={20} aria-hidden="true" /><span>{unavailable}</span></div>;
  if (empty) {
    const Icon = empty.icon ?? FolderOpen;
    return <div className={`sa-empty ${className}`}><span className="sa-empty__icon"><Icon size={20} aria-hidden="true" /></span><p className="sa-empty__title">{empty.title}</p></div>;
  }
  return <>{children}</>;
}

export function Panel({ title, description, count, children, className = "" }: { title: string; description?: string; count?: string; children: ReactNode; className?: string }) {
  return <section className={`sa-panel ${className}`}><header className="sa-panel__header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{count && <span className="sa-panel__count">{count}</span>}</header><div className="sa-panel__body">{children}</div></section>;
}

type Query<T> = Pick<UseQueryResult<T>, "data" | "isPending" | "error" | "refetch">;
function state<T>(query: Query<T>, empty?: EmptyState | false, unavailable?: string | false) {
  return { loading: query.isPending, error: query.error, empty, unavailable, onRetry: () => { void query.refetch(); } };
}

/**
 * Decorative trend line for a KPI card. The delta text beside it carries the same
 * information in words, so the graphic stays out of the accessibility tree and a
 * missing series degrades to no line instead of a misleading flat one.
 */
export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const height = 32, width = 100, inset = 2;
  const y = (value: number) => max === min ? height / 2 : inset + (1 - (value - min) / (max - min)) * (height - inset * 2);
  const step = width / (points.length - 1);
  const coordinates = points.map((value, index) => `${(index * step).toFixed(2)},${y(value).toFixed(2)}`).join(" ");
  return <svg className="sa-kpi__chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <polyline points={coordinates} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function KpiCard({ label, icon: Icon, value, loading, error, onRetry, warning }: { label: string; icon: typeof Building2; value?: Dashboard["companies"]; loading: boolean; error?: Error | null; onRetry: () => void; warning?: boolean }) {
  const { t, locale } = usePlatformLocale();
  const noteId = useId();
  const delta = value?.value != null && value.previous != null ? value.value - value.previous : null;
  const note = value?.value == null ? (warning ? t("legacyMetric") : t("dataUnavailable")) : warning ? t("failedMetric") : null;
  return <section className={`sa-kpi ${warning ? "sa-kpi--warning" : ""}`}>
    <div className={`sa-kpi__icon ${warning ? "sa-kpi__icon--warning" : ""}`}><Icon size={18} aria-hidden="true" /></div>
    <div className="sa-kpi__body">
      <p className="sa-kpi__label">{label}</p>
      <WidgetState loading={loading} error={error} onRetry={onRetry} className="sa-widget-state--compact">
        <strong className="sa-kpi__value" aria-describedby={note ? noteId : undefined}>{value?.value == null ? "—" : number(value.value, locale)}</strong>
        {value?.series && <Sparkline points={value.series} />}
        {delta != null && <p className={`sa-kpi__trend ${warning ? (delta > 0 ? "sa-kpi__trend--bad" : "sa-kpi__trend--good") : "sa-kpi__trend--good"}`}>{delta === 0 ? t("unchanged") : `${delta > 0 ? t("up") : t("down")} ${number(Math.abs(delta), locale)}`} <small>{t("comparison")}</small></p>}
        {note && <p className="sr-only" id={noteId}>{note}</p>}
      </WidgetState>
    </div>
  </section>;
}

export function KpiOverview({ query }: { query: Query<Dashboard> }) {
  const { t } = usePlatformLocale();
  const cards = [
    { label: t("totalCompanies"), icon: Building2, value: query.data?.companies },
    { label: t("totalUsers"), icon: Users, value: query.data?.users },
    { label: t("activeProjects"), icon: FolderOpen, value: query.data?.active_projects },
    { label: t("failedProcesses"), icon: FileWarning, value: query.data?.failed_jobs, warning: true },
  ];
  return <div className="sa-kpis">{cards.map((card) => <KpiCard key={card.label} {...card} loading={query.isPending} error={query.error} onRetry={() => { void query.refetch(); }} />)}</div>;
}

export function CompanyGrowthChart({ query }: { query: Query<Growth> }) {
  const { t, locale } = usePlatformLocale();
  const { tip, show, showAt, hide } = useDataTip();
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const points = query.data?.points ?? [];
  const max = Math.max(1, ...points.map((point) => point.new_companies));
  const width = 600, height = 210, left = 34, right = 10, top = 12, bottom = 30;
  const x = (index: number) => left + index * (width - left - right) / Math.max(1, points.length - 1);
  const y = (value: number) => top + (1 - value / max) * (height - top - bottom);
  const coordinates = points.map((point, index) => `${x(index)},${y(point.new_companies)}`).join(" ");
  const ticks = Array.from(new Set([0, .25, .5, .75, 1].map((fraction) => Math.round(max * fraction))));
  const content = (point: Growth["points"][number]) => ({
    title: date(point.start, locale),
    rows: [
      { label: t("newCompaniesFull"), value: number(point.new_companies, locale) },
      { label: t("total"), value: number(point.total_companies, locale) },
    ],
  });
  // Snap to the nearest plotted point so the pointer never lands "between" data.
  const inspect = (event: React.PointerEvent<HTMLDivElement>) => {
    const svg = svgRef.current;
    if (!svg || !points.length) return;
    const rect = svg.getBoundingClientRect();
    const at = (event.clientX - rect.left) / rect.width * width;
    let best = 0;
    for (let index = 1; index < points.length; index += 1) {
      if (Math.abs(x(index) - at) < Math.abs(x(best) - at)) best = index;
    }
    setActive(best);
    show(event, content(points[best]));
  };
  const step = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!points.length || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = active === null ? (direction === 1 ? 0 : points.length - 1) : Math.max(0, Math.min(points.length - 1, active + direction));
    setActive(next);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    showAt(rect.left + x(next) / width * rect.width, rect.top + y(points[next].new_companies) / height * rect.height, content(points[next]));
  };
  return <Panel title={t("growth")} description={t("growthDesc")} className="sa-panel--growth">
    <WidgetState {...state(query, !points.length && { title: t("growthEmptyTitle"), icon: TrendingUp })} className="sa-widget-state--chart">
      <div
        className="sa-chart"
        role="img"
        tabIndex={0}
        aria-label={`${t("newCompaniesFull")}: ${points.map((point) => `${date(point.start, locale)} ${number(point.new_companies, locale)} ${t("newCompanies")}, ${t("total")} ${number(point.total_companies, locale)}`).join(", ")}`}
        onPointerMove={inspect}
        onPointerLeave={() => { setActive(null); hide(); }}
        onKeyDown={step}
        onBlur={hide}
      >
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="var(--sa-grid-line)" strokeDasharray="3 4" strokeWidth="1" /><text x={left - 9} y={y(tick) + 4} textAnchor="end" fill="var(--sa-faint)" fontSize="11">{number(tick, locale)}</text></g>)}
          {points.length > 1 && <polygon points={`${left},${height - bottom} ${coordinates} ${x(points.length - 1)},${height - bottom}`} fill="var(--sa-blue)" opacity=".08" />}
          <polyline points={coordinates} fill="none" stroke="var(--sa-blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {active !== null && points[active] ? <line x1={x(active)} x2={x(active)} y1={top} y2={height - bottom} stroke="var(--sa-blue)" strokeOpacity=".28" strokeDasharray="3 3" strokeWidth="1" /> : null}
          {points.map((point, index) => <circle
            key={point.start}
            cx={x(index)}
            cy={y(point.new_companies)}
            r={active === index ? 5 : 3.5}
            fill={active === index ? "var(--sa-blue)" : "var(--sa-card)"}
            stroke="var(--sa-blue)"
            strokeWidth="2"
            className="sa-chart__dot"
          ><title>{`${date(point.start, locale)}: ${number(point.new_companies, locale)} ${t("newCompaniesFull")}, ${t("total")} ${number(point.total_companies, locale)} ${t("companiesWord")}`}</title></circle>)}
          {points.filter((_, i) => points.length <= 14 || i % Math.ceil(points.length / 8) === 0 || i === points.length - 1).map((point) => <text key={point.start} x={x(points.indexOf(point))} y={height - 8} textAnchor="middle" fill="var(--sa-faint)" fontSize="11">{new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { timeZone: "UTC", day: query.data?.period.range === "12m" ? undefined : "numeric", month: "short" }).format(new Date(point.start))}</text>)}
        </svg>
      </div><details className="sa-chart__details"><summary>{t("growthDetails")}</summary><ul>{points.map((point) => <li key={point.start}>{date(point.start, locale)}: <strong>{number(point.new_companies, locale)}</strong> {t("newCompanies")}, {t("total")} {number(point.total_companies, locale)}</li>)}</ul></details>
    </WidgetState>
    <DataTip tip={tip} />
  </Panel>;
}

export function CompanyStatusChart({ query }: { query: Query<CompanyStatus> }) {
  const { t, locale } = usePlatformLocale();
  const { tip, show, hide } = useDataTip();
  const [active, setActive] = useState<number | null>(null);
  const values = [{ label: t("active"), value: query.data?.active ?? 0, percentage: query.data?.active_percent ?? 0, color: "var(--sa-blue)" }, { label: t("suspended"), value: query.data?.suspended ?? 0, percentage: query.data?.suspended_percent ?? 0, color: "var(--sa-amber)" }, { label: t("archived"), value: query.data?.archived ?? 0, percentage: query.data?.archived_percent ?? 0, color: "var(--sa-faint)" }];
  const total = query.data?.total ?? 0;
  let cursor = 0;
  // Each slice keeps its own start/end so the pointer can be mapped back to it.
  const slices = values.map((item) => {
    const start = cursor;
    cursor += total ? item.value / total * 100 : 0;
    return { ...item, start, end: cursor };
  });
  const gradient = slices.map((slice) => `${slice.color} ${slice.start}% ${slice.end}%`).join(", ");
  const content = (slice: (typeof slices)[number]) => ({
    title: slice.label,
    rows: [
      { label: t("companiesWord"), value: number(slice.value, locale) },
      { label: t("share"), value: percent(slice.percentage, locale) },
    ],
  });
  const inspect = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    // The inner disc is not part of the ring, so it is not a hit target.
    if (Math.hypot(dx, dy) < rect.width * 0.37) { setActive(null); hide(); return; }
    const degrees = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    const hit = slices.findIndex((slice) => degrees >= slice.start && degrees < slice.end);
    if (hit < 0) return;
    setActive(hit);
    show(event, content(slices[hit]));
  };
  const highlight = active !== null && slices[active] ? slices[active] : null;
  return <Panel title={t("status")} description={t("statusDesc")} className="sa-panel--status">
    <WidgetState {...state(query, total === 0 && { title: t("noCompaniesTitle"), icon: Building2 })} className="sa-widget-state--chart">
      <div className="sa-status-chart">
        <div
          className={`sa-donut ${highlight ? "is-inspecting" : ""}`.trim()}
          style={{ background: `conic-gradient(${gradient})` }}
          role="img"
          aria-label={values.map((item) => `${item.label} ${number(item.value, locale)}`).join(", ")}
          onPointerMove={inspect}
          onPointerLeave={() => { setActive(null); hide(); }}
        >
          <span className="sa-donut__dim" aria-hidden="true" />
          {highlight ? <span className="sa-donut__slice" aria-hidden="true" style={{ background: `conic-gradient(${highlight.color} ${highlight.start}% ${highlight.end}%, transparent ${highlight.end}% 100%)` }} /> : null}
          <div><strong>{number(total, locale)}</strong><span>{t("companiesWord")}</span></div>
        </div>
        <ul onPointerLeave={() => { setActive(null); hide(); }}>
          {slices.map((slice, index) => <li
            key={slice.label}
            className={active === index ? "is-active" : undefined}
            onPointerEnter={(event) => { setActive(index); show(event, content(slice)); }}
          >
            <span className="sa-dot" style={{ background: slice.color }} />{slice.label}<strong>{number(slice.value, locale)}</strong><small>{percent(slice.percentage, locale)}</small>
          </li>)}
        </ul>
      </div>
    </WidgetState>
    <DataTip tip={tip} />
  </Panel>;
}

export function RecentActivityFeed({ query, now }: { query: Query<Activities>; now: number }) {
  const { t, locale } = usePlatformLocale();
  const items = query.data?.items ?? [];
  return <Panel title={t("activity")} description={t("activityDesc")} count={items.length ? t("activityCount").replace("{count}", number(items.length, locale)) : undefined} className="sa-panel--activity"><WidgetState {...state(query, !items.length && { title: t("noActivityTitle"), icon: Clock3 })}><ul className="sa-activity">{items.map((item) => <li key={item.id}><span className="sa-activity__icon"><Activity size={15} aria-hidden="true" /></span><div><strong>{activityTitle(item.type, locale)}</strong><small>{item.company_id ? t("companyMetadata") : t("systemActivity")}</small></div><time dateTime={item.occurred_at} title={dateTime(item.occurred_at, locale)}>{relativeTime(item.occurred_at, now, locale)}</time></li>)}</ul></WidgetState></Panel>;
}

export function RecentCompaniesTable({ query, search = "" }: { query: Query<Companies>; search?: string }) {
  const { t, locale } = usePlatformLocale();
  const companyCopy = useCompanyCopy();
  const { tip, show, hide } = useDataTip();
  const items = query.data?.items ?? [];
  const filtered = items.filter((item) => item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const empty = !items.length ? { title: t("noCompaniesTitle"), icon: Building2 } : !!search && !filtered.length ? { title: t("noMatches"), icon: Search } : false;
  const content = (item: Companies["items"][number]) => ({
    title: item.name,
    rows: [
      { label: t("plan"), value: item.subscription_plan ?? "—" },
      { label: t("users"), value: number(item.member_count, locale) },
      { label: t("projects"), value: item.project_count == null ? t("projectsUnavailable") : number(item.project_count, locale) },
      { label: t("status"), value: companyCopy[item.status] },
      { label: t("joined"), value: date(item.created_at, locale) },
    ],
  });
  return <Panel title={t("recentCompanies")} description={t("recentCompaniesDesc")} count={items.length ? t("companyCount").replace("{count}", number(items.length, locale)) : undefined} className="sa-panel--companies"><WidgetState {...state(query, empty)}><TableRegion label={t("recentCompanies")} caption={t("companyCaption")}><thead><tr><th>{t("company")}</th><th>{t("plan")}</th><th className="sa-number">{t("users")}</th><th className="sa-number">{t("projects")}</th><th>{t("status")}</th><th>{t("joined")}</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} onPointerEnter={(event) => show(event, content(item))} onPointerLeave={hide}><td><span className="sa-company-name" title={item.name}><span className="sa-company-monogram">{item.name.trim().slice(0, 2).toUpperCase()}</span><strong>{item.name}</strong></span></td><td>{item.subscription_plan ?? "—"}</td><td className="sa-number">{number(item.member_count, locale)}</td><td className="sa-number" title={item.project_count == null ? t("projectsUnavailable") : undefined}>{item.project_count == null ? "—" : number(item.project_count, locale)}</td><td><span className={`sa-badge sa-badge--${item.status}`}>{companyCopy[item.status]}</span></td><td><time dateTime={item.created_at} title={dateTime(item.created_at, locale)}>{date(item.created_at, locale)}</time></td></tr>)}</tbody></TableRegion></WidgetState><DataTip tip={tip} /></Panel>;
}

export function AttentionJobsTable({ query, now, search = "" }: { query: Query<Jobs>; now: number; search?: string }) {
  const { t, locale } = usePlatformLocale();
  const { tip, show, hide } = useDataTip();
  const items = query.data?.items ?? [];
  const term = search.toLocaleLowerCase();
  const filtered = items.filter((item) => `${item.company_name ?? ""} ${jobType(item.type, locale)}`.toLocaleLowerCase().includes(term));
  const empty = !items.length ? { title: t("noAttentionTitle"), icon: CircleCheck } : !!search && !filtered.length ? { title: t("noMatches"), icon: Search } : false;
  const content = (item: Jobs["items"][number]) => ({
    title: jobType(item.type, locale),
    rows: [
      { label: t("company"), value: item.company_name ?? t("noCompany") },
      { label: t("processStatus"), value: item.status === "failed" ? t("failed") : t("retryPending") },
      { label: t("time"), value: dateTime(item.failed_at ?? item.created_at, locale) },
      ...(item.error_code ? [{ label: t("errorCode"), value: item.error_code }] : []),
    ],
  });
  return <Panel title={t("attention")} description={t("attentionDesc")} count={items.length ? t("queueCount").replace("{count}", number(items.length, locale)) : undefined} className="sa-panel--jobs"><WidgetState {...state(query, empty)}><TableRegion label={t("attention")} caption={t("attentionCaption")}><thead><tr><th>{t("processType")}</th><th>{t("company")}</th><th>{t("processStatus")}</th><th>{t("time")}</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} onPointerEnter={(event) => show(event, content(item))} onPointerLeave={hide}><td><span className="sa-job-type"><Workflow size={15} aria-hidden="true" />{jobType(item.type, locale)}</span>{item.error_code === "JOB_EXECUTION_FAILED" && <small className="sa-job-note">{t("processFailed")}</small>}</td><td title={item.company_name ?? undefined}>{item.company_name ?? t("noCompany")}</td><td><span className={`sa-badge sa-badge--${item.status}`}>{item.status === "failed" ? t("failed") : t("retryPending")}</span></td><td><span>{item.failed_at ? t("failedAt") : t("createdAt")}</span><time dateTime={item.failed_at ?? item.created_at} title={dateTime(item.failed_at ?? item.created_at, locale)}>{relativeTime(item.failed_at ?? item.created_at, now, locale)}</time></td></tr>)}</tbody></TableRegion></WidgetState><DataTip tip={tip} /></Panel>;
}

export function SubscriptionDistribution({ query }: { query: Query<Distribution> }) {
  const { t, locale } = usePlatformLocale();
  const { tip, show, hide } = useDataTip();
  const items = query.data?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.companies, 0);
  return <Panel title={t("distribution")} description={t("distributionDesc")}><WidgetState {...state(query, query.data?.available && !items.length && { title: t("noSubscriptions"), icon: CreditCard }, query.data && !query.data.available && t("subscriptionsUnavailable"))}><ul className="sa-distribution">{items.map((item) => <li
    key={item.plan}
    onPointerEnter={(event) => show(event, {
      title: item.plan,
      rows: [
        { label: t("companiesWord"), value: number(item.companies, locale) },
        { label: t("share"), value: percent(total ? item.companies / total * 100 : 0, locale) },
      ],
    })}
    onPointerLeave={hide}
  ><span title={item.plan}>{item.plan}</span><div className="sa-meter"><span style={{ width: `${total ? item.companies / total * 100 : 0}%` }} /></div><strong>{number(item.companies, locale)}</strong><small>{percent(total ? item.companies / total * 100 : 0, locale)}</small></li>)}</ul></WidgetState><DataTip tip={tip} /></Panel>;
}

export function StorageUsage({ query }: { query: Query<Storage> }) {
  const { t, locale } = usePlatformLocale();
  const data = query.data;
  const usable = data?.used_bytes != null && (data.quota_state === "unlimited" || (data.quota_state === "limited" && data.quota_bytes != null && data.quota_bytes > 0));
  const usage = data?.used_bytes ?? 0;
  const capacity = data?.quota_bytes ?? 0;
  const ratio = data?.quota_state === "limited" && capacity ? usage / capacity * 100 : null;
  return <Panel title={t("storage")} description={t("storageDesc")}><WidgetState {...state(query, undefined, data && !usable && t("storageUnavailable"))}><div className="sa-storage"><div><HardDrive size={20} aria-hidden="true" /><strong>{bytes(usage, locale)}</strong><span>/ {data?.quota_state === "unlimited" ? t("unlimited") : bytes(capacity, locale)}</span></div>{ratio != null && <><p>{percent(ratio, locale)} {t("configuredCapacity")}</p><div className="sa-meter" role="meter" aria-label={t("storage")} aria-valuenow={usage} aria-valuemin={0} aria-valuemax={capacity}><span style={{ width: `${Math.min(100, ratio)}%` }} /></div></>}</div></WidgetState></Panel>;
}

export function IntegrationHealth({ query }: { query: Query<Integrations> }) {
  const { t, locale } = usePlatformLocale();
  const items = query.data ?? [];
  const labels: Record<string, string> = { telegram: "Telegram", email: "Email", object_storage: t("objectStorage"), worker: t("worker") };
  const icons: Record<string, typeof Mail> = { telegram: Plug, email: Mail, object_storage: HardDrive, worker: Workflow };
  const statuses: Record<string, string> = { healthy: t("healthy"), degraded: t("degraded"), unavailable: t("unavailable"), unknown: t("unknown") };
  return <Panel title={t("services")} description={t("servicesDesc")}><WidgetState {...state(query, !items.length && { title: t("noServices"), icon: Plug })}><ul className="sa-integrations">{items.map((item) => { const Icon = icons[item.name] ?? Plug; return <li key={item.name}><Icon size={16} aria-hidden="true" /><span>{labels[item.name] ?? t("service")}</span><strong className={`sa-health sa-health--${item.status}`}>{statuses[item.status] ?? t("unknown")}</strong>{item.checked_at && <time dateTime={item.checked_at} title={dateTime(item.checked_at, locale)}>{date(item.checked_at, locale)}</time>}</li>; })}</ul><p className="sa-panel__footnote sr-only">{t("healthNote")}</p></WidgetState></Panel>;
}
