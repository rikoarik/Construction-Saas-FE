"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

export function AuthShell({ children, back, backAction, compact = false }: { children: ReactNode; back?: string; backAction?: () => void; compact?: boolean }) {
  const t = useTranslations("auth");
  return (
    <main className={compact ? "auth-page auth-page--compact" : "auth-page"}>
      <header className="auth-header">
        <Link href="/" className="auth-brand">{t("brand")}</Link>
        <div className="auth-preferences"><LocaleControl /><ThemeControl /></div>
      </header>
      <div className="auth-layout">
        <section className="auth-content" aria-labelledby="auth-title">
          {backAction ? (
            <button type="button" className="auth-back auth-back--button" onClick={backAction}>← {t("backToLogin")}</button>
          ) : (
            <Link href={back ?? "/"} className="auth-back">← {t(back ? "backToLogin" : "back")}</Link>
          )}
          {children}
          <footer className="auth-legal" aria-label={t("legalLabel")}>
            <Link href="/support">{t("needHelp")}</Link>
            <Link href="/privacy">{t("privacyPolicy")}</Link>
            <Link href="/terms">{t("termsOfService")}</Link>
          </footer>
        </section>
        <aside className="auth-panel">
          <div className="auth-panel__drawing" aria-hidden="true"><span /><span /><span /></div>
          <div className="auth-panel__copy">
            <p className="auth-panel__label">{t("workspaceLabel")}</p>
            <h2>{t("panelTitle")}</h2>
            <p>{t("panelDescription")}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
