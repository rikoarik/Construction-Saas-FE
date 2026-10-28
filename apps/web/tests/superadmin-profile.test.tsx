import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Topbar } from "@/components/superadmin/shell";
import messages from "@/messages/id.json";

vi.mock("@/components/superadmin/use-dashboard", () => ({
  useOperator: () => ({ data: { mfa_verified: true, capabilities: ["platform.dashboard.read"] }, isPending: false, error: null }),
  useStorage: () => ({ data: undefined, isPending: false, error: null, refetch: vi.fn() }),
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
vi.mock("@/lib/api/session", () => ({ logout: vi.fn() }));

afterEach(cleanup);

const renderTopbar = () => render(
  <NextIntlClientProvider locale="id" messages={messages}>
    <Topbar email="ops@buildstack.id" toggleNav={vi.fn()} open={false} />
  </NextIntlClientProvider>,
);

describe("menu profil", () => {
  it("opens as a menu, focuses the first item, and closes on Escape", async () => {
    renderTopbar();
    const trigger = screen.getByRole("button", { name: "Menu akun" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    const item = screen.getByRole("menuitem", { name: "Keluar" });
    expect(menu).toContainElement(item);
    await waitFor(() => expect(item).toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes when the pointer goes down outside the menu", async () => {
    renderTopbar();
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
});
