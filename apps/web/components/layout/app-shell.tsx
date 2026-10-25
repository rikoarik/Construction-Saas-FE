"use client";

import { useState } from "react";
import { Bell, BriefcaseBusiness, ChevronDown, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

const navItems = [
  { href: "/", key: "overview" as const, icon: BriefcaseBusiness },
  { href: "/projects", key: "projects" as const },
  { href: "/reports", key: "reports" as const },
  { href: "/documents", key: "documents" as const },
  { href: "/people", key: "people" as const },
  { href: "/templates", key: "templates" as const },
  { href: "/settings", key: "settings" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const common = useTranslations("common");
  const home = useTranslations("home");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const companyName = common("companyPlaceholder");
  const projectName = common("projectPlaceholder");
  const accountName = common("profilePlaceholder");

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {common("skipToContent")}
      </a>

      <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
        <Link className="brand" href="/" onClick={() => setMobileOpen(false)}>
          <span aria-hidden="true" className="brand__mark">{common("brandMark")}</span>
          <span>{common("brand")}</span>
          <ChevronDown aria-hidden="true" className="brand__chevron" size={15} />
        </Link>

        <div className="workspace-label">{common("workspace")}</div>
        <div aria-label={common("company")} className="company-switcher">
          <span aria-hidden="true" className="company-switcher__mark">{companyName.slice(0, 1)}</span>
          <span className="company-switcher__copy">
            <span className="company-switcher__label">{common("company")}</span>
            <span className="company-switcher__name">{companyName}</span>
          </span>
          <ChevronDown aria-hidden="true" size={15} />
        </div>

        <div className="nav-label">{common("navigation")}</div>
        <nav aria-label={common("navigation")} className="primary-nav">
          {navItems.map(({ href, key, icon: Icon }) => (
            <Link
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-link${pathname === href ? " nav-link--active" : ""}`}
              href={href}
              key={key}
              onClick={() => setMobileOpen(false)}
            >
              {Icon ? <Icon aria-hidden="true" size={17} strokeWidth={1.8} /> : <span className="nav-link__marker" aria-hidden="true" />}
              <span>{common(key)}</span>
              {key === "reports" && <span className="nav-link__count">—</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="workspace-card">
            <span aria-hidden="true" className="workspace-card__mark">{projectName.slice(0, 1)}</span>
            <span className="workspace-card__copy">
              <span className="workspace-card__name">{projectName}</span>
              <span className="workspace-card__role">{common("project")}</span>
            </span>
            <ChevronDown aria-hidden="true" size={15} />
          </div>
          <div className="sidebar-user">
            <span aria-hidden="true" className="avatar">{accountName.slice(0, 1)}</span>
            <span className="sidebar-user__copy">
              <span className="sidebar-user__name">{accountName}</span>
              <span className="sidebar-user__role">{common("profile")}</span>
            </span>
            <button aria-label={common("menu")} className="icon-button" type="button">
              <ChevronDown aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label={common("closeNavigation")}
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <div className="workspace">
        <header className="topbar">
          <button
            aria-label={common(mobileOpen ? "closeNavigation" : "openNavigation")}
            className="icon-button mobile-menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
          >
            <Menu aria-hidden="true" size={19} />
          </button>
          <div className="breadcrumb">
            <span>{common("company")}</span>
            <span className="breadcrumb__separator">/</span>
            <span className="breadcrumb__current">{home("scopeLabel")}</span>
          </div>
          <div className="topbar__actions">
            <button aria-label={common("search")} className="icon-button search-button" type="button">
              <Search aria-hidden="true" size={17} />
              <span>{common("search")}</span>
              <kbd>⌘ K</kbd>
            </button>
            <LocaleControl />
            <ThemeControl />
            <span className="topbar__divider" />
            <button aria-label={common("menu")} className="icon-button notification-button" type="button">
              <Bell aria-hidden="true" size={17} />
              <span className="notification-indicator" />
            </button>
            <span aria-hidden="true" className="avatar avatar--top">{accountName.slice(0, 1)}</span>
          </div>
        </header>
        <main className="main-content" id="main-content">{children}</main>
      </div>
    </div>
  );
}
