"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

/** Presentation only. The session/route owner must supply authorized destinations after verifying scope. */
export type ShellDestination = { href: string; label: string };
export type ShellScope =
  | { kind: "company"; name: string; destinations: ShellDestination[] }
  | { kind: "project"; name: string; companyName: string; destinations: ShellDestination[]; projectsHref?: string };

type AppShellProps = { children: React.ReactNode; scope?: ShellScope };

export function AppShell({ children, scope }: AppShellProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) drawer.current?.focus();
  }, [mobileOpen]);

  const closeDrawer = () => setMobileOpen(false);
  const destinations = scope?.destinations ?? [{ href: "/", label: t("overview") }];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t("skipToContent")}</a>
      <aside
        aria-label={t("navigation")}
        className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}
        id={drawerId}
        ref={drawer}
        tabIndex={-1}
      >
        <Link className="brand" href="/" onClick={closeDrawer}>
          <span aria-hidden="true" className="brand__mark">{t("brandMark")}</span>
          <span>{t("brand")}</span>
        </Link>
        {scope && (
          <div className="shell-scope">
            <span className="shell-scope__label">{t(scope.kind)}</span>
            <strong className="shell-scope__name" title={scope.name}>{scope.name}</strong>
            {scope.kind === "project" && (
              <span className="shell-scope__parent" title={scope.companyName}>{scope.companyName}</span>
            )}
          </div>
        )}
        <nav aria-label={t("navigation")} className="primary-nav">
          {scope?.kind === "project" && scope.projectsHref && (
            <Link className="nav-link nav-link--back" href={scope.projectsHref} onClick={closeDrawer}>
              <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{t("backToProjects")}</span>
            </Link>
          )}
          {destinations.map(({ href, label }) => (
            <Link
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-link${pathname === href ? " nav-link--active" : ""}`}
              href={href}
              key={href}
              onClick={closeDrawer}
            >
              <BriefcaseBusiness aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar__preferences">
          <span>{t("appearance")}</span>
          <ThemeControl />
        </div>
      </aside>

      {mobileOpen && <button aria-label={t("closeNavigation")} className="mobile-scrim" onClick={() => { closeDrawer(); menuButton.current?.focus(); }} type="button" />}

      <div className="workspace">
        <header className="topbar">
          <button
            aria-controls={drawerId}
            aria-expanded={mobileOpen}
            aria-label={t(mobileOpen ? "closeNavigation" : "openNavigation")}
            className="icon-button mobile-menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            ref={menuButton}
            type="button"
          >
            {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
          <div className="breadcrumb" title={scope?.name ?? t("brand")}>
            {scope?.name ?? t("brand")}
          </div>
          <div className="topbar__actions">
            <LocaleControl />
          </div>
        </header>
        <main className="main-content" id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
