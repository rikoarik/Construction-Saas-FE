import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OtpField } from "../components/auth/otp-field";

afterEach(cleanup);

describe("authenticator code field", () => {
  it("keeps a labeled six-digit input and exposes the value to the form", () => {
    const { container } = render(<form><OtpField label="Authenticator code" /></form>);
    const input = screen.getByRole("textbox", { name: "Authenticator code" });
    fireEvent.change(input, { target: { value: "12a345678" } });
    expect(input).toHaveValue("123456");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("pattern", "[0-9]{6}");
    expect(new FormData(container.querySelector("form")!).get("code")).toBe("123456");
    expect(container.querySelectorAll(".auth-otp__slot")).toHaveLength(6);
    expect(container.querySelector(".auth-otp__slots")).toHaveAttribute("aria-hidden", "true");
  });

  it("highlights only the current digit slot while focused", () => {
    const { container } = render(<OtpField label="Authenticator code" />);
    const input = screen.getByRole("textbox", { name: "Authenticator code" });
    const activeSlots = () => container.querySelectorAll(".auth-otp__slot--active");

    fireEvent.focus(input);
    expect(activeSlots()).toHaveLength(1);
    expect(activeSlots()[0]).toBe(container.querySelectorAll(".auth-otp__slot")[0]);

    fireEvent.change(input, { target: { value: "123" } });
    expect(activeSlots()).toHaveLength(1);
    expect(activeSlots()[0]).toBe(container.querySelectorAll(".auth-otp__slot")[3]);

    fireEvent.blur(input);
    expect(activeSlots()).toHaveLength(0);
  });

  it("disables the input during verification", () => {
    render(<OtpField label="Authenticator code" disabled />);
    expect(screen.getByRole("textbox", { name: "Authenticator code" })).toBeDisabled();
  });
});
