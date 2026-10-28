"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, login } from "@/lib/api/session";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"credentials" | "rate" | "unavailable" | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await login({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401 ? "credentials" : cause instanceof ApiError && cause.status === 429 ? "rate" : "unavailable");
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-content">
        <p className="auth-brand">{t("brand")}</p>
        <h1>{t("title")}</h1>
        <p className="auth-intro">{t("intro")}</p>
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="password">{t("password")}</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          {error && <p role="alert" className="auth-error">{t(error)}</p>}
          <button className="button button--primary" type="submit" disabled={pending}>{pending ? t("signingIn") : t("signIn")}</button>
        </form>
      </div>
    </main>
  );
}
