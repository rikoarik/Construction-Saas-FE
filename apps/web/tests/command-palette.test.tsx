import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandPalette, rankEntries, type PaletteEntry } from "@/components/superadmin/command-palette";
import messages from "@/messages/id.json";

afterEach(cleanup);

const run = () => vi.fn();
const entries: PaletteEntry[] = [
  { id: "page", group: "pages", label: "Dashboard", hint: "Ringkasan platform", icon: null, run: run() },
  { id: "alpha", group: "companies", label: "Alpha Build", hint: "Pro · Aktif", icon: null, run: run() },
  { id: "cipta", group: "companies", label: "Cipta Karya", hint: "Basic · Aktif", icon: null, run: run() },
  { id: "job", group: "processes", label: "Pengiriman email", hint: "Alpha Build · Gagal", icon: null, run: run() },
  { id: "dark", group: "actions", label: "Tema gelap", icon: null, run: run() },
];

const renderPalette = (props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) => render(
  <NextIntlClientProvider locale="id" messages={messages}>
    <CommandPalette open onClose={vi.fn()} entries={entries} onFilter={vi.fn()} {...props} />
  </NextIntlClientProvider>,
);

describe("command palette", () => {
  it("searches every group, not just the visible dashboard lists", async () => {
    renderPalette();
    const field = screen.getByRole("combobox", { name: "Cari perusahaan, proses, atau perintah" });
    await waitFor(() => expect(field).toHaveFocus());
    // A company that is not in the "5 latest" tables is still reachable.
    fireEvent.change(field, { target: { value: "cipta" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Cipta Karya");
  });

  it("ranks a prefix match first and groups the results", () => {
    renderPalette();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "a" } });
    const groups = screen.getAllByRole("group").map((node) => node.getAttribute("aria-label"));
    expect(groups).toContain("Perusahaan");
    expect(groups).toContain("Proses");
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Alpha Build");
  });

  it("moves with the arrow keys, opens the active entry on Enter, and closes", async () => {
    const onClose = vi.fn();
    const first = run();
    const second = run();
    renderPalette({
      onClose,
      entries: [
        { id: "a", group: "pages", label: "Dashboard", icon: null, run: first },
        { id: "b", group: "pages", label: "Data perusahaan", icon: null, run: second },
      ],
    });
    const field = screen.getByRole("combobox");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    const list = screen.getByRole("listbox");
    expect(within(list).getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    expect(field).toHaveAttribute("aria-activedescendant", within(list).getAllByRole("option")[1].id);
    fireEvent.keyDown(field, { key: "Enter" });
    expect(second).toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps Tab inside the dialog", () => {
    renderPalette();
    const field = screen.getByRole("combobox");
    fireEvent.keyDown(field, { key: "Tab" });
    expect(field).toHaveFocus();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("falls back to filtering the dashboard when nothing matches", async () => {
    const onFilter = vi.fn();
    const onClose = vi.fn();
    renderPalette({ onFilter, onClose });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.getByText("Tidak ada hasil.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Saring dashboard untuk “zzz”" }));
    await waitFor(() => expect(onFilter).toHaveBeenCalledWith("zzz"));
    expect(onClose).toHaveBeenCalled();
  });

  it("returns focus to the trigger when it closes", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { rerender } = render(<NextIntlClientProvider locale="id" messages={messages}><CommandPalette open onClose={vi.fn()} entries={entries} onFilter={vi.fn()} /></NextIntlClientProvider>);
    rerender(<NextIntlClientProvider locale="id" messages={messages}><CommandPalette open={false} onClose={vi.fn()} entries={entries} onFilter={vi.fn()} /></NextIntlClientProvider>);
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });
});

describe("rankEntries", () => {
  it("caps each group so one noisy category cannot flood the list", () => {
    const many: PaletteEntry[] = Array.from({ length: 9 }, (_, index) => ({
      id: `c${index}`, group: "companies", label: `Company ${index}`, icon: null, run: run(),
    }));
    expect(rankEntries(many, "company")).toHaveLength(5);
  });

  it("matches hints as well as labels", () => {
    expect(rankEntries(entries, "pro").map((entry) => entry.id)).toContain("alpha");
  });
});
