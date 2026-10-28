import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttentionJobsTable, CompanyStatusChart, IntegrationHealth, KpiCard, RecentCompaniesTable, WidgetState } from "@/components/superadmin/widgets";
import { date, number, relativeTime } from "@/components/superadmin/format";
import type { Companies } from "@/lib/api/platform-dashboard";
import { FileWarning } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import type { Jobs, CompanyStatus, Integrations } from "@/lib/api/platform-dashboard";

const query = <T,>(data: T) => ({ data, isPending: false, error: null, refetch: vi.fn() });
afterEach(cleanup);
const renderId = (children: React.ReactNode) => render(<NextIntlClientProvider locale="id">{children}</NextIntlClientProvider>);

describe("dashboard platform", () => {
  it("distinguishes legacy creation time from failure time and shows safe classification", () => {
    const base = { company_id: null, company_name: null, type: "email.delivery", status: "failed" as const, created_at: "2026-01-01T00:00:00Z", available_at: "2026-01-01T00:00:00Z", attempts: 1, retry_eligible: false };
    const jobs: Jobs = { items: [{ ...base, id: 1, failed_at: null, error_code: null }, { ...base, id: 2, failed_at: "2026-01-02T00:00:00Z", error_code: "JOB_EXECUTION_FAILED" }], limit: 5, offset: 0, has_more: false };
    renderId(<AttentionJobsTable query={query(jobs)} now={0} />);
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText(/Dibuat \(waktu gagal tidak tersedia\)/)).toBeInTheDocument();
    expect(within(rows[2]).getByText("Gagal:")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Pelaksanaan proses gagal.")).toBeInTheDocument();
  });

  it("explains the failed job metric and its unavailable state", () => {
    const props = { label: "Proses Gagal", icon: FileWarning, loading: false, onRetry: vi.fn(), warning: true };
    const { rerender } = renderId(<KpiCard {...props} value={{ value: null, previous: null, series: null }} />);
    expect(screen.getByText(/proses lama tanpa waktu kegagalan/)).toBeInTheDocument();
    rerender(<NextIntlClientProvider locale="id"><KpiCard {...props} value={{ value: 3, previous: 1, series: [0, 1, 0, 2] }} /></NextIntlClientProvider>);
    expect(screen.getByText(/kegagalan terakhir dalam periode terpilih/)).toBeInTheDocument();
    expect(screen.getByText(/Naik 2/)).toBeInTheDocument();
  });

  it("draws a decorative trend line only when the backend supplies a series", () => {
    const props = { label: "Total Perusahaan", icon: FileWarning, loading: false, onRetry: vi.fn() };
    const { container, rerender } = renderId(<KpiCard {...props} value={{ value: 14, previous: 12, series: [9, 10, 10, 12, 14] }} />);
    const chart = container.querySelector(".sa-kpi__chart");
    expect(chart).not.toBeNull();
    // The graphic is redundant with the delta text, so it must stay silent.
    expect(chart).toHaveAttribute("aria-hidden", "true");
    expect(chart?.querySelector("polyline")?.getAttribute("points")?.split(" ")).toHaveLength(5);
    rerender(<NextIntlClientProvider locale="id"><KpiCard {...props} value={{ value: 14, previous: null, series: null }} /></NextIntlClientProvider>);
    expect(container.querySelector(".sa-kpi__chart")).toBeNull();
    // A single point cannot describe a trend; no line is better than a fake one.
    rerender(<NextIntlClientProvider locale="id"><KpiCard {...props} value={{ value: 14, previous: 12, series: [14] }} /></NextIntlClientProvider>);
    expect(container.querySelector(".sa-kpi__chart")).toBeNull();
  });

  it("displays percentages supplied by the backend", () => {
    const data: CompanyStatus = { active: 1, suspended: 1, archived: 1, total: 3, active_percent: 33.3, suspended_percent: 33.3, archived_percent: 33.4 };
    renderId(<CompanyStatusChart query={query(data)} />);
    expect(screen.getByText("33,4%")).toBeInTheDocument();
  });

  it("does not equate unknown or worker liveness with provider health", () => {
    const data: Integrations = [{ name: "worker", status: "healthy", checked_at: null }, { name: "telegram", status: "unknown", checked_at: null }];
    renderId(<IntegrationHealth query={query(data)} />);
    expect(screen.getByText("Tidak diketahui")).toBeInTheDocument();
    expect(screen.getByText(/bukan kesehatan penyedia/)).toBeInTheDocument();
  });

  it("filters only the loaded latest company and process rows", () => {
    const companies: Companies = { items: [{ id: "1", name: "Alpha Build", status: "active", created_at: "2026-01-01T00:00:00Z", member_count: 2, project_count: null, subscription_plan: null }, { id: "2", name: "Beta Works", status: "active", created_at: "2026-01-02T00:00:00Z", member_count: 1, project_count: null, subscription_plan: null }], limit: 5, offset: 0, has_more: true };
    const jobs: Jobs = { items: [{ id: 1, type: "email.delivery", status: "failed", company_id: null, company_name: "Alpha Build", created_at: "2026-01-01T00:00:00Z", available_at: "2026-01-01T00:00:00Z", failed_at: null, error_code: null, attempts: 1, retry_eligible: false }], limit: 5, offset: 0, has_more: true };
    renderId(<><RecentCompaniesTable query={query(companies)} search="alpha" /><AttentionJobsTable query={query(jobs)} now={0} search="alpha" /></>);
    expect(screen.getAllByText("Alpha Build")).toHaveLength(2);
    expect(screen.queryByText("Beta Works")).not.toBeInTheDocument();
    cleanup();
    renderId(<><RecentCompaniesTable query={query(companies)} search="unknown" /><AttentionJobsTable query={query(jobs)} now={0} search="unknown" /></>);
    expect(screen.getAllByText("Tidak ada entri yang cocok pada daftar terbaru.")).toHaveLength(2);
  });

  it("localizes dashboard copy, counts, dates and relative time", () => {
    const data: CompanyStatus = { active: 1000, suspended: 1, archived: 0, total: 1001, active_percent: 99.9, suspended_percent: 0.1, archived_percent: 0 };
    render(<NextIntlClientProvider locale="en"><CompanyStatusChart query={query(data)} /></NextIntlClientProvider>);
    expect(screen.getByText("Company status")).toBeInTheDocument();
    expect(screen.getByText("1,001")).toBeInTheDocument();
    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(number(1001, "id")).toBe("1.001");
    expect(date("2026-01-02T00:00:00Z", "en")).toContain("Jan");
    expect(relativeTime("2026-01-01T00:00:00Z", Date.parse("2026-01-01T02:00:00Z"), "en")).toBe("2 hours ago");
  });

  it("isolates a partial widget error and offers retry", () => {
    const retry = vi.fn();
    renderId(<><WidgetState error={new Error("offline")} onRetry={retry}>Tidak terlihat</WidgetState><div>Widget lain tersedia</div></>);
    expect(screen.getByRole("alert")).toHaveTextContent("Data tidak dapat dimuat.");
    expect(screen.getByText("Widget lain tersedia")).toBeInTheDocument();
    screen.getByRole("button", { name: "Coba lagi" }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
