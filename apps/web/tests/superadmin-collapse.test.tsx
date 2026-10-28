import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SuperadminLayout } from "@/components/superadmin/shell";
import messages from "@/messages/id.json";

/** Storage payload the sidebar sees; each test sets it before rendering. */
const state = vi.hoisted(() => ({ storage: undefined as unknown, capabilities: ["platform.dashboard.read"] as string[] }));

vi.mock("@/components/superadmin/use-dashboard", () => ({
  useOperator: () => ({ data: { mfa_verified: true, capabilities: state.capabilities }, isPending: false, error: null }),
  useStorage: () => ({ data: state.storage, isPending: false, error: null, refetch: vi.fn() }),
  usePaletteCompanies: () => ({ data: undefined, isPending: false, error: null }),
  useNotifications: () => ({ data: { items: [], unread: 0, type: "", read: "" }, isPending: false, error: null, refetch: vi.fn() }),
  useRefreshNotifications: () => vi.fn(),
  usePaletteJobs: () => ({ data: undefined, isPending: false, error: null }),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
  usePathname: () => "/superadmin/dashboard",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

/** Pretend a desktop viewport so the sidebar exposes its collapse affordance. */
function desktop(matches = true) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query, addEventListener: () => {}, removeEventListener: () => {} }));
}

const measured = {
  used_bytes: 428_000_000_000,
  quota_bytes: 1_000_000_000_000,
  quota_state: "limited",
  api_requests: { used: 1_200_000, limit: 5_000_000 },
};

/** No storage source and no metered traffic: nothing measurable at all. */
const unmeasured = { used_bytes: null, quota_bytes: null, quota_state: "unknown", api_requests: null };

afterEach(() => { cleanup(); vi.unstubAllGlobals(); state.storage = undefined; state.capabilities = ["platform.dashboard.read"]; });

const renderShell = () => render(
  <NextIntlClientProvider locale="id" messages={messages}><SuperadminLayout><button>Konten</button></SuperadminLayout></NextIntlClientProvider>,
);

describe("company navigation permissions", () => {
  it("links to Perusahaan when the verified operator has company read access", () => {
    state.capabilities = ["platform.dashboard.read", "platform.company.read"];
    desktop();
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Menu utama" });
    expect(nav.querySelector('a[href="/superadmin/companies"]')).toHaveTextContent("Perusahaan");
    expect([...nav.querySelectorAll(".sa-nav__link--disabled")].some((item) => item.textContent?.includes("Perusahaan"))).toBe(false);
  });

  it("does not create an unauthorized company link", () => {
    desktop();
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Menu utama" });
    expect(nav.querySelector('a[href="/superadmin/companies"]')).toBeNull();
    expect([...nav.querySelectorAll(".sa-nav__link--disabled")].some((item) => item.textContent?.includes("Perusahaan") && item.textContent?.includes("Segera"))).toBe(true);
  });
});

describe("sidebar collapse", () => {
  it("uses the brand mark as the collapse and expand control", () => {
    desktop();
    const { container } = renderShell();
    const toggle = screen.getByRole("button", { name: "Ringkas navigasi" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveClass("sa-brand__mark");
    expect(container.querySelector(".sa-sidebar__collapse")).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Perluas navigasi" })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(".sa-shell")).toHaveClass("sa-shell--collapsed");

    fireEvent.click(screen.getByRole("button", { name: "Perluas navigasi" }));
    expect(screen.getByRole("button", { name: "Ringkas navigasi" })).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector(".sa-shell")).not.toHaveClass("sa-shell--collapsed");
  });

  it("renders the mark as a plain logo on small screens, where collapsing is not offered", () => {
    desktop(false);
    const { container } = renderShell();
    expect(screen.queryByRole("button", { name: "Ringkas navigasi" })).not.toBeInTheDocument();
    expect(container.querySelector(".sa-brand__mark")?.tagName).toBe("SPAN");
  });

  it("keeps the usage card as a ring when the rail collapses", () => {
    state.storage = measured;
    desktop();
    const { container } = renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Ringkas navigasi" }));

    // The card is never removed from the rail; it becomes the same ring shape as
    // the status donut so usage stays readable at 48px.
    expect(container.querySelector(".sa-usage")).not.toBeNull();
    const ring = container.querySelector(".sa-usage__ring") as HTMLElement;
    expect(ring).not.toBeNull();
    expect(ring.style.background).toContain("conic-gradient");
    expect(ring).toHaveAccessibleName("Storage 43%");
  });
});

describe("sidebar usage", () => {
  it("shows both measurements as a used / limit pair over a bar", () => {
    state.storage = measured;
    desktop();
    const { container } = renderShell();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("API Request")).toBeInTheDocument();
    expect(screen.getByText("428 GB")).toBeInTheDocument();
    expect(screen.getByText("/ 1 TB")).toBeInTheDocument();
    // 428 GB of 1 TB, and 1,2 jt of 5 jt.
    expect([...container.querySelectorAll(".sa-usage__pct")].map((el) => el.textContent)).toEqual(["43%", "24%"]);
    const bars = [...container.querySelectorAll(".sa-usage__bar")];
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveAccessibleName("Storage");
    expect(bars[0].firstElementChild?.getAttribute("style")).toContain("42.8%");
    expect(bars[1].firstElementChild?.getAttribute("style")).toContain("24%");
  });

  it("keeps a row for a metric it cannot measure, without inventing numbers", () => {
    state.storage = unmeasured;
    desktop();
    const { container } = renderShell();
    // Both rows stay: a missing row reads as a measurement that vanished.
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("API Request")).toBeInTheDocument();
    // But no figure, no percentage, and no meter to announce: unmetered is not 0.
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    for (const bar of container.querySelectorAll(".sa-usage__bar")) {
      expect(bar).not.toHaveAttribute("role");
      expect(bar.firstElementChild).toBeNull();
    }
  });

  it("shows a configured storage limit without inventing usage or a percentage", () => {
    state.storage = { ...unmeasured, quota_state: "limited", quota_bytes: 1_000_000_000_000 };
    desktop();
    const { container } = renderShell();
    expect(screen.getByText("/ 1 TB")).toBeInTheDocument();
    expect(container.querySelector(".sa-usage__pct")).toBeNull();
    expect(container.querySelector(".sa-usage__bar--storage")?.firstElementChild).toBeNull();
  });

  it("keeps storage listed when only requests are metered", () => {
    state.storage = { ...unmeasured, api_requests: { used: 2_000_000, limit: 5_000_000 } };
    desktop();
    const { container } = renderShell();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.queryByText("428 GB")).not.toBeInTheDocument();
    expect([...container.querySelectorAll(".sa-usage__pct")].map((el) => el.textContent)).toEqual(["40%"]);
  });
});
