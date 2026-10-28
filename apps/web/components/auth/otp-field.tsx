"use client";

import { useState, type ChangeEvent } from "react";

type OtpFieldProps = {
  label: string;
  disabled?: boolean;
};

export function OtpField({ label, disabled = false }: OtpFieldProps) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  function update(event: ChangeEvent<HTMLInputElement>) {
    setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <div className="auth-otp-field">
      <label htmlFor="code">{label}</label>
      <div className="auth-otp">
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={update}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required
        />
        <div className="auth-otp__slots" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <span className={`auth-otp__slot${focused && !disabled && index === Math.min(code.length, 5) ? " auth-otp__slot--active" : ""}`} key={index}>{code[index] ?? "\u00a0"}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
