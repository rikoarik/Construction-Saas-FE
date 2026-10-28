import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "@/components/ui/primitives";

afterEach(cleanup);

const options = [
  { value: "7d", label: "7 hari terakhir", hint: "22–28 Okt" },
  { value: "30d", label: "30 hari terakhir", hint: "28 Sep–28 Okt" },
];

describe("dropdown", () => {
  it("opens as a listbox, marks the selection, and reports the chosen value", async () => {
    const onChange = vi.fn();
    render(<Dropdown label="Rentang waktu" value="7d" options={options} onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: "Rentang waktu: 7 hari terakhir" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("listbox", { name: "Rentang waktu" });
    expect(within(list).getAllByRole("option")).toHaveLength(2);
    expect(within(list).getByRole("option", { name: /7 hari terakhir/ })).toHaveAttribute("aria-selected", "true");
    expect(within(list).getByText("28 Sep–28 Okt")).toBeInTheDocument();
    fireEvent.click(within(list).getByRole("option", { name: /30 hari terakhir/ }));
    expect(onChange).toHaveBeenCalledWith("30d");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("does not fire onChange when the current value is re-selected", () => {
    const onChange = vi.fn();
    render(<Dropdown label="Rentang waktu" value="7d" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Rentang waktu/ }));
    fireEvent.click(screen.getByRole("option", { name: /7 hari terakhir/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<Dropdown label="Rentang waktu" value="7d" options={options} onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Rentang waktu/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes when the pointer goes down outside the control", async () => {
    render(<Dropdown label="Rentang waktu" value="7d" options={options} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Rentang waktu/ }));
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("shows the resolved period as a menu caption", () => {
    render(<Dropdown label="Rentang waktu" value="7d" options={options} onChange={vi.fn()} menuCaption="28 Sep 2026 – 28 Okt 2026 UTC" />);
    fireEvent.click(screen.getByRole("button", { name: /Rentang waktu/ }));
    expect(screen.getByText("28 Sep 2026 – 28 Okt 2026 UTC")).toBeInTheDocument();
  });
});
