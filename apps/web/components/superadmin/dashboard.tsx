"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Dropdown } from "@/components/ui/primitives";
import { usePlatformLocale } from "./locale";
import { isRange, type Range } from "@/lib/api/platform-dashboard";
import { date } from "./format";
import { SuperadminLayout } from "./shell";
import { useActivities, useCompanies, useCompanyStatus, useDashboard, useDistribution, useGrowth, useIntegrations, useJobs, useStorage, DashboardQueryProvider } from "./use-dashboard";
import { AttentionJobsTable, CompanyGrowthChart, CompanyStatusChart, IntegrationHealth, KpiOverview, RecentActivityFeed, RecentCompaniesTable, StorageUsage, SubscriptionDistribution } from "./widgets";

export function DashboardHeader({ range, period, onChange }: { range: NonNullable<Range>; period?: { start: string; end: string }; onChange: (range: NonNullable<Range>) => void }) {
  const { t, locale } = usePlatformLocale();
  const rangeLabels: Record<NonNullable<Range>, string> = { "7d": t("days7"), "30d": t("days30"), "90d": t("days90"), "12m": t("months12") };
  const span = period ? `${date(period.start, locale)} – ${date(period.end, locale)}` : undefined;
  return <div className="sa-heading">
    <div><h1>{t("welcome")}</h1><p>{t("overview")}</p></div>
    <div className="sa-heading__filter">
      <div className="sa-heading__meta">
        {span && <span className="sa-period"><CalendarDays size={15} aria-hidden="true" />{span}<em>{t("utcLabel")}</em></span>}
      </div>
      <Dropdown
        className="sa-range"
        label={t("range")}
        value={range}
        align="end"
        icon={<CalendarDays size={15} />}
        menuCaption={span ? `${span} ${t("utcLabel")}` : undefined}
        options={(Object.keys(rangeLabels) as Array<NonNullable<Range>>).map((value) => ({ value, label: rangeLabels[value] }))}
        onChange={(next) => { if (isRange(next)) onChange(next); }}
      />
    </div>
  </div>;
}

function DashboardContent({ range }: { range: NonNullable<Range> }) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = usePlatformLocale();
  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const updateRange = (nextRange: NonNullable<Range>) => {
    const query = new URLSearchParams();
    query.set("range", nextRange);
    if (search) query.set("q", search);
    router.replace(`/superadmin/dashboard?${query.toString()}`);
  };
  const overview = useDashboard(range);
  const growth = useGrowth(range);
  const status = useCompanyStatus();
  const activities = useActivities();
  const companies = useCompanies();
  const jobs = useJobs();
  const distribution = useDistribution();
  const storage = useStorage();
  const integrations = useIntegrations();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); };
  }, []);
  return <>
    <DashboardHeader range={range} period={overview.data?.period} onChange={updateRange} />
    {search && <p className="sa-search__result" role="status">{t("searchResults").replace("{term}", search)}</p>}
    <KpiOverview query={overview} />
    <div className="sa-grid sa-grid--analytics"><CompanyGrowthChart query={growth} /><CompanyStatusChart query={status} /><RecentActivityFeed query={activities} now={now} /></div>
    <div className="sa-grid sa-grid--tables"><RecentCompaniesTable query={companies} search={search} /><AttentionJobsTable query={jobs} now={now} search={search} /></div>
    <div className="sa-grid sa-grid--operations"><SubscriptionDistribution query={distribution} /><StorageUsage query={storage} /><IntegrationHealth query={integrations} /></div>
  </>;
}

export function SuperadminDashboard({ range }: { range: NonNullable<Range> }) {
  return <DashboardQueryProvider><SuperadminLayout><DashboardContent range={range} /></SuperadminLayout></DashboardQueryProvider>;
}
