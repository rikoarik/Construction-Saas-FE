import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hint } from "@/components/ui/primitives";
import { usePointerGlow } from "@/components/superadmin/use-pointer-glow";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/** jsdom reports a 0x0 rect for every element; the hook only needs stable numbers. */
const rect = { x: 0, y: 0, top: 0, left: 0, right: 300, bottom: 200, width: 300, height: 200, toJSON: () => ({}) };

function withHover() {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} }));
}

describe("hint", () => {
  it("exposes the explanation as a tooltip bound to the trigger", () => {
    render(<Hint label="Penjelasan cakupan" text="Hanya menyaring daftar terbaru." />);
    const trigger = screen.getByRole("button", { name: "Penjelasan cakupan" });
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Hanya menyaring daftar terbaru.");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });
});

describe("pointer glow", () => {
  it("writes the pointer offset into the hovered card", async () => {
    withHover();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect);
    const card = document.createElement("div");
    card.className = "sa-kpi";
    const inner = document.createElement("span");
    card.append(inner);
    document.body.append(card);
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });

    renderHook(() => usePointerGlow());
    act(() => { inner.dispatchEvent(new MouseEvent("pointermove", { clientX: 120, clientY: 80, bubbles: true })); });
    act(() => { frames.forEach((callback) => callback(0)); });

    expect(card.style.getPropertyValue("--sa-mx")).toBe("120px");
    expect(card.style.getPropertyValue("--sa-my")).toBe("80px");
  });

  it("does nothing when the pointer is not hovering a card", () => {
    withHover();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
    renderHook(() => usePointerGlow());
    act(() => { document.body.dispatchEvent(new MouseEvent("pointermove", { clientX: 10, clientY: 10, bubbles: true })); });
    act(() => { frames.forEach((callback) => callback(0)); });
    expect(frames).toHaveLength(0);
  });
});
