import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Topbar } from "@/components/superadmin/shell";
import { SuperadminLayout } from "@/components/superadmin/shell";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/id.json";

vi.mock("@/components/superadmin/use-dashboard", () => ({ useOperator: () => ({ data: { mfa_verified: true, capabilities: ["platform.dashboard.read"] }, isPending: false, error: null }), useStorage: () => ({ data: undefined, isPending: false, error: null, refetch: vi.fn() }),
  usePaletteCompanies: () => ({ data: undefined, isPending: false, error: null }),
  useNotifications: () => ({ data: { items: [], unread: 0, type: "", read: "" }, isPending: false, error: null, refetch: vi.fn() }),
  useRefreshNotifications: () => vi.fn(),
  usePaletteJobs: () => ({ data: undefined, isPending: false, error: null }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));
const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({ Link: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>, usePathname: () => "/superadmin/dashboard", useRouter: () => ({ replace, refresh: vi.fn() }) }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("navigasi mobile", () => {
  it("moves and traps focus, closes with Escape, and returns focus", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<NextIntlClientProvider locale="id" messages={messages}><SuperadminLayout><button>Konten</button></SuperadminLayout></NextIntlClientProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Gelap" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Terang" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: "Bahasa" }));
    fireEvent.click(screen.getByRole("option", { name: /Bahasa Inggris/ }));
    expect(replace).toHaveBeenCalledWith("/superadmin/dashboard", { locale: "en" });
    fireEvent.click(screen.getByRole("button", { name: "Cari di seluruh platform" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Cari perusahaan, proses, atau perintah" }), { target: { value: "Alpha Build" } });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(replace).toHaveBeenCalledWith("/superadmin/dashboard?range=30d&q=Alpha+Build");
    const trigger = screen.getByRole("button", { name: "Buka navigasi" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Navigasi platform" });
    const close = within(dialog).getByRole("button", { name: "Tutup navigasi" });
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(close).toHaveFocus();
    expect(dialog.nextElementSibling).toHaveProperty("inert", true);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(link).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the selected range when searching and clearing the visible latest lists", () => {
    window.history.replaceState(null, "", "/id/superadmin/dashboard?range=90d&q=old");
    render(<NextIntlClientProvider locale="id" messages={messages}><Topbar email="operator@example.test" open={false} toggleNav={vi.fn()} /></NextIntlClientProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Cari di seluruh platform" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Cari perusahaan, proses, atau perintah" }), { target: { value: "Cipta Karya" } });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(replace).toHaveBeenCalledWith("/superadmin/dashboard?range=90d&q=Cipta+Karya");
    fireEvent.click(screen.getByRole("button", { name: "Hapus pencarian" }));
    expect(replace).toHaveBeenCalledWith("/superadmin/dashboard?range=90d");
    window.history.replaceState(null, "", "/");
  });
});
