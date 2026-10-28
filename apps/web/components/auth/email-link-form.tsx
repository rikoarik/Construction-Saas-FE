"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { Button } from "@/components/ui/primitives";
import { ApiError, submitEmailLink } from "@/lib/api/session";

type LinkKind = "reset-password" | "verify-email" | "invitations/accept";

export function EmailLinkForm({ kind, token }: { kind: LinkKind; token: string }) {
  const t = useTranslations("auth");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const { message, dismiss, notify } = useNoticeToast();
  const [passwordError, setPasswordError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !token) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password && password !== data.get("confirmation")) {
      setPasswordError(t("passwordMismatch"));
      notify(t("passwordMismatch"));
      document.getElementById("confirmation")?.focus();
      return;
    }
    setPending(true);
    dismiss();
    setPasswordError("");
    try {
      await submitEmailLink(kind, token, password);
      setDone(true);
    } catch (cause) {
      notify(cause instanceof ApiError && cause.status === 401 && kind === "invitations/accept" ? t("invitationLogin") : t("linkError"), cause instanceof ApiError && cause.status === 429 ? "warning" : "error");
    } finally {
      setPending(false);
    }
  }

  const title = kind === "reset-password" ? "resetTitle" : kind === "verify-email" ? "verifyTitle" : "invitationTitle";
  const intro = kind === "reset-password" ? "resetIntro" : kind === "verify-email" ? "verifyIntro" : "invitationIntro";
  const action = kind === "reset-password" ? "resetAction" : kind === "verify-email" ? "verifyAction" : "invitationAction";

  return (
    <AuthShell back="/login">
      <div className="auth-heading">
        <p className="auth-label">{t("workspaceLabel")}</p>
        <h1 id="auth-title">{t(title)}</h1>
        <p className="auth-intro">{t(intro)}</p>
      </div>
      {done ? (
        <div className="auth-result" role="status">
          <p>{t("linkSuccess")}</p>
          <Link href="/login" className="button button--primary">{t("backToLogin")}</Link>
        </div>
      ) : !token ? (
        <div className="auth-result">
          <p role="alert" className="auth-error">{t("linkError")}</p>
          <Link href="/login" className="button button--primary">{t("backToLogin")}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="auth-form">
          {kind === "invitations/accept" && <p className="auth-notice">{t("invitationHelp")}</p>}
          {kind !== "verify-email" && <>
            <label htmlFor="password">{t("newPassword")}</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={1024} required={kind === "reset-password"} />
            <label htmlFor="confirmation">{t("confirmPassword")}</label>
            <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={1024} required={kind === "reset-password"} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "confirmation-error" : undefined} onChange={() => setPasswordError("")} />
            {passwordError && <p id="confirmation-error" className="auth-field-error">{passwordError}</p>}
          </>}
          <Button variant="primary" busy={pending} type="submit">{t(action)}</Button>
        </form>
      )}
      <NoticeToast message={message} onDismiss={dismiss} dismissLabel={t("dismissNotice")} />
    </AuthShell>
  );
}
