import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoticeToast, type NoticeMessage } from "../components/ui/notice-toast";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function show(message: NoticeMessage, onDismiss = vi.fn()) {
  render(<NoticeToast message={message} onDismiss={onDismiss} dismissLabel="Dismiss" />);
  return onDismiss;
}

describe("NoticeToast", () => {
  it("auto-dismisses errors after their longer reading time and exit motion", () => {
    vi.useFakeTimers();
    const onDismiss = show({ id: 1, tone: "error", text: "Wrong email or password" });
    expect(screen.getByRole("alert")).toHaveTextContent("Wrong email or password");
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByRole("alert")).toHaveClass("notice-toast--exiting");
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("pauses success messages while hovered and allows manual dismiss", () => {
    vi.useFakeTimers();
    const onDismiss = show({ id: 2, tone: "success", text: "Saved" });
    const toast = screen.getByRole("status");
    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(6000));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
