import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "@/components/superadmin/notifications";
import messages from "@/messages/id.json";

type Item = {
  key: string;
  type: "process_failed" | "process_retry" | "company_suspended" | "subscription_past_due";
  severity: "error" | "warning";
  company_id: string | null;
  company_name: string | null;
  event_type: string | null;
  error_code: string | null;
  plan: string | null;
  occurred_at: string;
  read: boolean;
};

const state = vi.hoisted(() => ({
  items: [] as Item[],
  unread: 0,
  calls: [] as Array<{ type: string; read: string }>,
  refresh: 0,
  unavailable: false,
}));

vi.mock("@/components/superadmin/use-dashboard", () => ({
  useNotifications: (type: string, read: string) => {
    state.calls.push({ type, read });
    return { data: state.unavailable ? undefined : { items: state.items, unread: state.unread, type, read }, isPending: false, error: state.unavailable ? new Error("offline") : null, refetch: vi.fn() };
  },
  useRefreshNotifications: () => async () => { state.refresh += 1; },
}));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); state.items = []; state.unread = 0; state.calls = []; state.refresh = 0; state.unavailable = false; });

const failed: Item = {
  key: "process:42", type: "process_failed", severity: "error", company_id: "c1", company_name: "PT Contoh",
  event_type: "email.delivery", error_code: "JOB_EXECUTION_FAILED", plan: null,
  occurred_at: "2026-10-28T10:00:00Z", read: false,
};
const pastDue: Item = {
  key: "subscription:7", type: "subscription_past_due", severity: "warning", company_id: "c2", company_name: "CV Uji",
  event_type: null, error_code: null, plan: "Growth", occurred_at: "2026-10-27T10:00:00Z", read: false,
};

function renderBell() {
  return render(<NextIntlClientProvider locale="id" messages={messages}><NotificationBell /></NextIntlClientProvider>);
}

describe("notifikasi header", () => {
  it("shows the unread count on the trigger and the feed inside the panel", () => {
    state.items = [failed, pastDue];
    state.unread = 2;
    renderBell();
    const trigger = screen.getByRole("button", { name: "2 belum dibaca" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("dialog", { name: "Notifikasi" });
    expect(panel).toBeTruthy();
    expect(screen.getByText("Proses gagal")).toBeTruthy();
    expect(screen.getByText("Langganan menunggak")).toBeTruthy();
    expect(screen.getByText("Growth")).toBeTruthy();
    expect(screen.getByText("PT Contoh")).toBeTruthy();
    // Mark-all is available while anything is unread.
    expect((screen.getByRole("button", { name: "Tandai semua" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("filters by type and read state through the query hook", () => {
    state.items = [failed];
    state.unread = 1;
    renderBell();
    fireEvent.click(screen.getByRole("button", { name: "1 belum dibaca" }));
    fireEvent.click(screen.getByRole("button", { name: "Proses" }));
    expect(state.calls.at(-1)).toEqual({ type: "process", read: "" });
    fireEvent.click(screen.getByRole("button", { name: "Sudah dibaca" }));
    expect(state.calls.at(-1)).toEqual({ type: "process", read: "read" });
    // The active filter is reflected in the pressed state, not only in colour.
    expect(screen.getByRole("button", { name: "Sudah dibaca" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Proses" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("posts the read marker with a CSRF token and refreshes the feed", async () => {
    state.items = [failed];
    state.unread = 1;
    const fetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
      const url = String(input);
      if (url.endsWith("/auth/csrf")) return { ok: true, status: 200, json: async () => ({ csrf_token: "t".repeat(40) }) } as Response;
      return { ok: true, status: 204 } as Response;
    });
    vi.stubGlobal("fetch", fetch);
    renderBell();
    fireEvent.click(screen.getByRole("button", { name: "1 belum dibaca" }));
    fireEvent.click(screen.getByRole("button", { name: "Tandai dibaca — Proses gagal" }));
    await waitFor(() => expect(state.refresh).toBe(1));
    const post = fetch.mock.calls.find(([url]) => String(url).endsWith("/platform/notifications/read"));
    expect(post).toBeTruthy();
    const init = post?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["X-CSRF-Token"]).toBe("t".repeat(40));
    expect(init.body).toBe(JSON.stringify({ keys: ["process:42"] }));
  });

  it("offers the empty state and disables mark-all when everything is read", () => {
    state.items = [];
    state.unread = 0;
    renderBell();
    fireEvent.click(screen.getByRole("button", { name: "Buka notifikasi" }));
    expect(screen.getByText("Tidak ada notifikasi.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Tandai semua" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("does not claim everything is read when the feed is unavailable", () => {
    state.unavailable = true;
    renderBell();
    fireEvent.click(screen.getByRole("button", { name: "Buka notifikasi" }));
    expect(screen.queryByText("Semua sudah dibaca")).toBeNull();
    expect(screen.getByText("Data belum tersedia")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Tandai semua" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    state.items = [failed];
    state.unread = 1;
    renderBell();
    const trigger = screen.getByRole("button", { name: "1 belum dibaca" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Notifikasi" })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    // The exit animation unmounts the panel a frame later.
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Notifikasi" })).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});
