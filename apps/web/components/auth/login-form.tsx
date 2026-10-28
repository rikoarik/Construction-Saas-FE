"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Download, Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpField } from "@/components/auth/otp-field";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { Button } from "@/components/ui/primitives";
import { ApiError, forgotPassword, isPlatformAdmin, login, startEnrollment, verifyMFA } from "@/lib/api/session";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const { message, dismiss, notify } = useNoticeToast();
  const [stage, setStage] = useState<"login" | "forgot" | "enroll" | "challenge" | "recovery" | "codes">("login");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [codes, setCodes] = useState<string[]>([]);

  function downloadRecoveryCodes() {
    if (codes.length === 0) return;
    const blob = new Blob([codes.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dexotic-groundwork-recovery-codes.txt";
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function finish() {
    const platformAdmin = await isPlatformAdmin();
    router.replace(platformAdmin ? "/platform" : "/");
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    dismiss();
    try {
      if (stage === "forgot") {
        await forgotPassword(String(form.get("email") ?? ""));
        notify(t("resetSent"), "success");
      } else if (stage === "login") {
        const next = await login({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
        if (next === "mfa_enrollment_required") {
          const enrollment = await startEnrollment();
          setOtpAuthUrl(enrollment.otpauth_url);
          setStage("enroll");
        } else if (next === "mfa_required") setStage("challenge");
        else await finish();
      } else if (stage === "codes") {
        await finish();
        setCodes([]);
      } else {
        const recoveryCodes = await verifyMFA(stage === "enroll" ? "enrollment/confirm" : stage, String(form.get("code") ?? ""));
        if (stage === "enroll") {
          if (recoveryCodes.length === 0) throw new ApiError("invalid_response");
          setOtpAuthUrl("");
          setCodes(recoveryCodes);
          setStage("codes");
        } else await finish();
      }
      setPending(false);
    } catch (cause) {
      const status = cause instanceof ApiError ? cause.status : undefined;
      const key = status === 429 ? "rate" : stage === "login" && status === 401 ? "credentials" : stage === "forgot" ? "resetError" : stage === "enroll" && status === 401 ? "enrollError" : stage === "challenge" && status === 401 ? "mfaError" : stage === "recovery" && status === 401 ? "recoveryError" : "unavailable";
      notify(t(key), status === 429 ? "warning" : "error");
      setPending(false);
    }
  }

  return (
    <AuthShell backAction={stage === "forgot" ? () => { setStage("login"); dismiss(); } : undefined} compact={stage === "enroll" || stage === "codes"}>
          <div className="auth-heading">
            <p className="auth-label">{t("workspaceLabel")}</p>
            <h1 id="auth-title">{t(stage === "forgot" ? "resetTitle" : stage === "enroll" ? "enrollTitle" : stage === "challenge" ? "challengeTitle" : stage === "recovery" ? "recoveryTitle" : stage === "codes" ? "codesTitle" : "title")}</h1>
            <p className="auth-intro">{t(stage === "forgot" ? "forgotIntro" : stage === "enroll" ? "enrollIntro" : stage === "challenge" ? "challengeIntro" : stage === "recovery" ? "recoveryIntro" : stage === "codes" ? "codesIntro" : "intro")}</p>
          </div>
          <form onSubmit={submit} className={stage === "enroll" ? "auth-form auth-form--enroll" : "auth-form"}>
            {(stage === "login" || stage === "forgot") && <><label htmlFor="email">{t("email")}</label><input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></>}
            {stage === "login" && <>
              <label htmlFor="password">{t("password")}</label>
              <div className="auth-password">
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                <button type="button" className="auth-password__toggle" aria-label={showPassword ? t("hidePassword") : t("showPassword")} aria-pressed={showPassword} aria-controls="password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              <button type="button" className="auth-forgot" onClick={() => { setStage("forgot"); dismiss(); }}>{t("forgotPassword")}</button>
            </>}
            {stage === "enroll" && <>
              <p className="auth-step">{t("mfaSetup")}</p>
              <div className="auth-qr-frame"><QRCodeSVG className="auth-qr" value={otpAuthUrl} size={168} marginSize={3} level="M" role="img" title={t("mfaQrLabel")} /></div>
            </>}
            {(stage === "enroll" || stage === "challenge" || stage === "recovery") && <>
              {stage === "recovery" ? (
                <><label htmlFor="code">{t("recoveryCode")}</label><input id="code" name="code" autoComplete="off" className="auth-code-input" required /></>
              ) : <OtpField key={stage} label={t("mfaCode")} disabled={pending} />}
              {stage !== "enroll" && <button type="button" className="auth-forgot" onClick={() => { setStage(stage === "recovery" ? "challenge" : "recovery"); dismiss(); }}>{stage === "recovery" ? t("useAuthenticator") : t("useRecovery")}</button>}
            </>}
            {stage === "codes" && <>
              <p className="auth-notice auth-notice--warning">{t("saveCodes")}</p>
              <ul className="auth-codes">{codes.map((code) => <li key={code}><code>{code}</code></li>)}</ul>
              <Button type="button" variant="secondary" className="auth-download" onClick={downloadRecoveryCodes} disabled={pending || codes.length === 0}>
                <Download size={18} aria-hidden="true" />{t("downloadCodes")}
              </Button>
            </>}
            <Button variant="primary" type="submit" busy={pending}>{stage === "login" ? t("signIn") : stage === "forgot" ? t("sendReset") : stage === "codes" ? t("continue") : t("verify")}</Button>
          </form>
          <NoticeToast message={message} onDismiss={dismiss} dismissLabel={t("dismissNotice")} />
    </AuthShell>
  );
}
