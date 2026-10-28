import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import messages from "@/messages/id.json";
import { date, number, percent } from "@/components/superadmin/format";
import {
  AttentionJobsTable,
  CompanyGrowthChart,
  CompanyStatusChart,
  RecentCompaniesTable,
  SubscriptionDistribution,
} from "@/components/superadmin/widgets";
import type { Companies, CompanyStatus, Distribution, Growth, Jobs } from "@/lib/api/platform-dashboard";

afterEach(cleanup);

const points = [3, 5, 4, 8, 6, 9, 7, 11, 9, 12].map((value, index) => ({
  start: new Date(Date.UTC(2026, 8, 1 + index * 3)).toISOString(),
  end: new Date(Date.UTC(2026, 8, 3 + index * 3)).toISOString(),
  new_companies: value,
  total_companies: 40 + index * 4,
}));

const growth: Growth = {
  period: { range: "30d", start: "2026-09-01T00:00:00Z", end: "2026-10-01T00:00:00Z" },
  points,
};

const status: CompanyStatus = {
  total: 128,
  active: 96,
  suspended: 21,
  archived: 11,
  active_percent: 75,
  suspended_percent: 16.4,
  archived_percent: 8.6,
};

const companies: Companies = {
  items: [
    { id: "c1", name: "Cipta Karya Nusantara", status: "active", subscription_plan: "Pro", member_count: 42, project_count: 18, created_at: "2026-09-21T04:00:00Z" },
    { id: "c2", name: "Bangun Persada", status: "suspended", subscription_plan: "Basic", member_count: 12, project_count: null, created_at: "2026-09-14T04:00:00Z" },
  ],
  limit: 5,
  offset: 0,
  has_more: false,
};

const jobs: Jobs = {
  items: [
    {
      id: 1, company_id: "c1", company_name: "Cipta Karya Nusantara", type: "email.delivery",
      status: "failed", error_code: "JOB_EXECUTION_FAILED", created_at: "2026-09-28T02:10:00Z",
      failed_at: "2026-09-28T02:12:00Z", available_at: "2026-09-28T02:20:00Z", attempts: 2, retry_eligible: true,
    },
  ],
  limit: 5,
  offset: 0,
  has_more: false,
};

const distribution: Distribution = {
  available: true,
  items: [
    { plan: "Pro", companies: 60 },
    { plan: "Basic", companies: 40 },
  ],
};

const query = <T,>(data: T) => ({ data, isPending: false, error: null, refetch: () => {} }) as never;

const renderId = (ui: React.ReactNode) => render(
  <NextIntlClientProvider locale="id" messages={messages}>{ui}</NextIntlClientProvider>,
);

/**
 * jsdom ships no `PointerEvent`, so `fireEvent.pointerMove` builds a plain Event
 * and drops the coordinates. A real MouseEvent of the same type reaches React's
 * pointer listener with `clientX`/`clientY` intact.
 */
const pointer = (element: Element, type: "pointermove" | "pointerover" | "pointerout", x = 0, y = 0) =>
  fireEvent(element, new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));

/** jsdom has no layout: hand the hit-testing maths a believable box. */
function box(element: Element, width: number, height: number, left = 0, top = 0) {
  element.getBoundingClientRect = () => ({
    width, height, left, top, x: left, y: top, right: left + width, bottom: top + height,
    toJSON: () => ({ width, height, left, top }),
  });
}

/** The tip is portalled to <body>, so it is never inside the render container. */
const tips = () => document.querySelectorAll(".sa-data-tip");

/**
 * Labels are reused sentence fragments ("perusahaan baru") that the stylesheet
 * capitalises, so compare them case-insensitively and values exactly.
 */
function expectRows(expected: Array<[string, string]>) {
  const actual = [...document.querySelectorAll(".sa-data-tip__rows > div")].map((row) => [
    row.querySelector("dt")!.textContent!,
    row.querySelector("dd")!.textContent!,
  ] as [string, string]);
  const normalize = (rows: Array<[string, string]>) => rows.map(([label, value]) => [label.toLocaleLowerCase(), value]);
  expect(normalize(actual)).toEqual(normalize(expected));
}

describe("data tips", () => {
  it("snaps the growth chart to the nearest point and shows its values", () => {
    const { container } = renderId(<CompanyGrowthChart query={query(growth)} />);
    const chart = container.querySelector(".sa-chart") as HTMLElement;
    box(chart.querySelector("svg")!, 600, 210);

    // x(5) = 34 + 5 * 61.8 ≈ 343, y(9) = 12 + (1 - 9/12) * 168 = 54.
    pointer(chart, "pointermove", 343, 54);

    expect(tips()).toHaveLength(1);
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent(date(points[5].start));
    expectRows([
      ["Perusahaan baru", number(points[5].new_companies)],
      ["Total", number(points[5].total_companies)],
    ]);
    // The inspected dot is the one that grows.
    const active = [...container.querySelectorAll(".sa-chart__dot")].filter((dot) => dot.getAttribute("r") === "5");
    expect(active).toHaveLength(1);
    expect(Number(active[0].getAttribute("cx"))).toBeCloseTo(342.9, 0);
  });

  it("steps the growth chart with the arrow keys for pointer-free inspection", () => {
    const { container } = renderId(<CompanyGrowthChart query={query(growth)} />);
    const chart = container.querySelector(".sa-chart") as HTMLElement;
    box(chart.querySelector("svg")!, 600, 210);
    chart.focus();

    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent(date(points[0].start));
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent(date(points[1].start));
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent(date(points[0].start));
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent(date(points[0].start));
  });

  it("maps the donut pointer to the slice under it", async () => {
    const { container } = renderId(<CompanyStatusChart query={query(status)} />);
    const donut = container.querySelector(".sa-donut") as HTMLElement;
    box(donut, 124, 124);

    // Centre (62,62); (100,20) is 56.6px out, i.e. on the ring, at 42° → "Aktif".
    pointer(donut, "pointermove", 100, 20);
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent("Aktif");
    expectRows([["Perusahaan", number(96)], ["Porsi", percent(75)]]);
    expect(document.querySelector(".sa-donut")?.className).toContain("is-inspecting");

    // The inner disc is a hole, not a slice.
    pointer(donut, "pointermove", 66, 62);
    await waitFor(() => expect(tips()).toHaveLength(0));
    expect(document.querySelector(".sa-donut")?.className).not.toContain("is-inspecting");
  });

  it("reads a table row's numbers without leaving the table", () => {
    const { container } = renderId(<RecentCompaniesTable query={query(companies)} />);
    const row = container.querySelector(".ui-table tbody tr") as HTMLElement;

    pointer(row, "pointerover", 420, 300);
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent("Cipta Karya Nusantara");
    expectRows([
      ["Paket", "Pro"],
      ["Pengguna", number(42)],
      ["Proyek", number(18)],
      ["Status Perusahaan", "Aktif"],
      ["Bergabung", date("2026-09-21T04:00:00Z")],
    ]);

    pointer(row, "pointerout");
    return waitFor(() => expect(tips()).toHaveLength(0));
  });

  it("explains a job row with its company, status, and error code", () => {
    const { container } = renderId(<AttentionJobsTable query={query(jobs)} now={Date.parse("2026-10-01T00:00:00Z")} />);
    const row = container.querySelector(".ui-table tbody tr") as HTMLElement;
    pointer(row, "pointerover", 420, 300);
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent("Pengiriman email");
    const text = document.querySelector(".sa-data-tip")?.textContent ?? "";
    expect(text).toContain("Cipta Karya Nusantara");
    expect(text).toContain("JOB_EXECUTION_FAILED");
  });

  it("shows the plan share on a distribution bar", () => {
    const { container } = renderId(<SubscriptionDistribution query={query(distribution)} />);
    const row = container.querySelector(".sa-distribution li") as HTMLElement;
    pointer(row, "pointerover", 300, 300);
    expect(document.querySelector(".sa-data-tip__title")).toHaveTextContent("Pro");
    expectRows([["Perusahaan", number(60)], ["Porsi", percent(60)]]);
  });

  it("escapes the card so a neighbouring panel cannot paint over it", () => {
    const { container } = renderId(<RecentCompaniesTable query={query(companies)} />);
    pointer(container.querySelector(".ui-table tbody tr") as HTMLElement, "pointerover", 300, 300);
    const tip = document.querySelector(".sa-data-tip") as HTMLElement;
    // Inside the panel it would inherit `.sa-panel > *` (position: relative,
    // z-index: 1) and be clipped by the table's scroll box.
    expect(tip.parentElement).toBe(document.body);
    expect(tip.closest(".sa-panel")).toBeNull();
    expect(container.querySelector(".sa-data-tip")).toBeNull();
  });

  it("escapes the card so a neighbouring panel cannot paint over it", () => {
    const { container } = renderId(<RecentCompaniesTable query={query(companies)} />);
    pointer(container.querySelector(".ui-table tbody tr") as HTMLElement, "pointerover", 320, 320);
    const tip = tips()[0] as HTMLElement;
    // Inside the panel it would inherit `.sa-panel > *` (position: relative,
    // z-index: 1) and be clipped by the table's own scroll box.
    expect(tip.parentElement).toBe(document.body);
    expect(tip.closest(".sa-panel")).toBeNull();
    expect(container.querySelector(".sa-data-tip")).toBeNull();
  });

  it("keeps the tip inside the viewport when the pointer sits at the right edge", () => {
    const { container } = renderId(<RecentCompaniesTable query={query(companies)} />);
    const row = container.querySelector(".ui-table tbody tr") as HTMLElement;
    pointer(row, "pointerover", window.innerWidth - 4, window.innerHeight - 4);
    const tip = document.querySelector(".sa-data-tip") as HTMLElement;
    expect(tip.style.left).toBe(`${window.innerWidth - 4 - 252 - 14}px`);
    expect(Number.parseFloat(tip.style.top)).toBeLessThan(window.innerHeight);
  });
});
