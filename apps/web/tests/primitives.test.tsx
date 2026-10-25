import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button, Dialog, TableRegion, TextField } from "../components/ui/primitives";

afterEach(() => vi.restoreAllMocks());

describe("accessible primitives", () => {
  it("exposes native button semantics, disabled, and busy state", () => {
    render(<Button variant="primary" busy>Save changes</Button>);
    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("associates field labels, hint, and validation error", () => {
    render(<TextField label="Work email" type="email" required hint="Use your company address" error="Enter a valid email" />);
    const input = screen.getByRole("textbox", { name: "Work email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const references = input.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(references).toHaveLength(2);
    expect(document.getElementById(references[0])).toHaveTextContent("Use your company address");
    expect(document.getElementById(references[1])).toHaveTextContent("Enter a valid email");
  });

  it("uses native modal dialog behavior and closes on Escape", () => {
    const onOpenChange = vi.fn();
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    const close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: showModal });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: close });
    render(<Dialog open onOpenChange={onOpenChange} title="Delete draft" closeLabel="Close dialog" description="This removes the draft."><p>Draft name</p></Dialog>);
    const dialog = screen.getByRole("dialog", { name: "Delete draft" });
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog).toHaveAccessibleDescription("This removes the draft.");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers a named keyboard-scrollable table region with native headers", () => {
    render(
      <TableRegion label="Project budgets" caption="Budget items">
        <thead><tr><th scope="col">Work item</th><th scope="col">Amount</th></tr></thead>
        <tbody><tr><th scope="row">Concrete</th><td data-numeric="true">1200</td></tr></tbody>
      </TableRegion>,
    );
    const region = screen.getByRole("region", { name: "Project budgets" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("table", { name: "Budget items" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: "Concrete" })).toHaveAttribute("scope", "row");
  });
});
