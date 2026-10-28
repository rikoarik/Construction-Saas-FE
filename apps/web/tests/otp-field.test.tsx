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

  it("disables the input during verification", () => {
    render(<OtpField label="Authenticator code" disabled />);
    expect(screen.getByRole("textbox", { name: "Authenticator code" })).toBeDisabled();
  });
});
