"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, CalendarDays, ChevronDown, CreditCard, FileText, Languages, Laptop, LayoutDashboard, LayoutTemplate, Link2, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, Users, Workflow, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/api/session";
import { Button } from "@/components/ui/primitives";
import { isRange } from "@/lib/api/platform-dashboard";
import { ThemeControl, updateTheme } from "@/components/theme/theme-provider";
import { LocaleControl } from "@/components/theme/locale-control";
import { useCompanyCopy, usePlatformLocale } from "./locale";
import { bytes, compact, percent } from "./format";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { useOperator, usePaletteCompanies, usePaletteJobs, useStorage } from "./use-dashboard";
import { usePointerGlow } from "./use-pointer-glow";
import { jobType } from "./format";
import { CommandPalette, type PaletteEntry } from "./command-palette";
import { NotificationBell } from "./notifications";

const navigation = [
  { key: "dashboard", icon: LayoutDashboard, href: "/superadmin/dashboard", capability: "platform.dashboard.read" },
  { key: "company", icon: Building2, href: "/superadmin/companies", capability: "platform.company.read" },
  { key: "subscriptions", icon: CreditCard },
  { key: "users", icon: Users },
  { key: "processes", icon: Workflow },
  { key: "audit", icon: FileText },
  { key: "integrations", icon: Link2 },
  { key: "templates", icon: LayoutTemplate },
  { key: "settings", icon: Settings },
] as const;

function SidebarUsage() {
  const { t, locale } = usePlatformLocale();
  const storage = useStorage();
  const data = storage.data;
  const capacity = data?.quota_bytes ?? 0;
  const used = data?.used_bytes ?? null;
  const requests = data?.api_requests ?? null;
  // Two rows, always. A metric without a source keeps its label and its empty
  // track — dropping the row would read as a measurement that disappeared —
  // but it gets no numbers and no percentage, because there is nothing measured
  // to report and a dash or a 0% would be a claim.
  const storageRatio = data?.quota_state === "limited" && capacity > 0 && used != null ? Math.min(100, used / capacity * 100) : null;
  const apiLimit = requests?.limit ?? 0;
  const apiUsed = requests?.used ?? null;
  const apiRatio = apiUsed != null && apiLimit > 0 ? Math.min(100, apiUsed / apiLimit * 100) : null;
  // The collapsed rail has 48px: it keeps whichever ratio exists as a ring.
  const ring = storageRatio != null ? { ratio: storageRatio, tone: "green", label: t("usageStorage") }
    : apiRatio != null ? { ratio: apiRatio, tone: "blue", label: t("usageApi") } : null;
  return <div className="sa-usage">
    <p className="sa-usage__title">{t("usageTitle")}</p>
    <div className="sa-usage__body">
      <div className="sa-usage__group">
        <div className="sa-usage__row"><span>{t("usageStorage")}</span>{(used != null || capacity > 0) && <span>{used != null && <strong>{bytes(used, locale)}</strong>}{capacity > 0 && <em> / {bytes(capacity, locale)}</em>}</span>}</div>
        {storageRatio != null
          ? <div className="sa-usage__bar sa-usage__bar--storage" role="meter" aria-label={t("usageStorage")} aria-valuenow={Math.min(used!, capacity)} aria-valuemin={0} aria-valuemax={capacity}><span style={{ width: `${storageRatio}%` }} /></div>
          : <div className="sa-usage__bar sa-usage__bar--storage" aria-hidden="true" />}
        {storageRatio != null && <p className="sa-usage__pct">{percent(Math.round(storageRatio), locale)}</p>}
      </div>
      <div className="sa-usage__group">
        <div className="sa-usage__row"><span>{t("usageApi")}</span>{apiUsed != null && <span><strong>{compact(apiUsed, locale)}</strong>{apiLimit > 0 && <em> / {compact(apiLimit, locale)}</em>}</span>}</div>
        {apiRatio != null
          ? <div className="sa-usage__bar" role="meter" aria-label={t("usageApi")} aria-valuenow={Math.min(apiUsed!, apiLimit)} aria-valuemin={0} aria-valuemax={apiLimit}><span style={{ width: `${apiRatio}%` }} /></div>
          : <div className="sa-usage__bar" aria-hidden="true" />}
        {apiRatio != null && <p className="sa-usage__pct">{percent(Math.round(apiRatio), locale)}</p>}
      </div>
    </div>
    {/* Collapsed sidebar: the card shrinks to a ring, the same shape as the status donut. */}
    <span
      className="sa-usage__ring"
      role={ring ? "img" : undefined}
      aria-label={ring ? `${ring.label} ${percent(Math.round(ring.ratio), locale)}` : undefined}
      style={{ background: ring ? `conic-gradient(var(--sa-${ring.tone}) ${ring.ratio}%, var(--sa-track) 0)` : "var(--sa-track)" }}
    >
      {/* The inner disc stays so an unmeasured platform reads as an empty ring
          rather than a filled dot; only a real ratio gets a number inside. */}
      <span aria-hidden="true">{ring ? percent(Math.round(ring.ratio), locale) : null}</span>
    </span>
  </div>;
}

export function SidebarNavigation({ open, collapsed, close, toggleCollapse, capabilities, collapsible }: { open: boolean; collapsed: boolean; close: () => void; toggleCollapse: () => void; capabilities: string[]; collapsible: boolean }) {
  const { t } = usePlatformLocale();
  const pathname = usePathname();
  return <>
    {open && <Button className="sa-scrim" aria-label={t("closeNav")} tabIndex={-1} onClick={close} />}
    <aside id="navigasi-platform" className={`sa-sidebar ${open ? "sa-sidebar--open" : ""} ${collapsed ? "sa-sidebar--collapsed" : ""}`} aria-label={t("nav")} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined}>
      <div className="sa-sidebar__top">
        <div className="sa-brand">
          {collapsible
            ? <Button
                className="sa-brand__mark"
                aria-label={collapsed ? t("expandNav") : t("collapseNav")}
                aria-expanded={!collapsed}
                title={collapsed ? t("expandNav") : t("collapseNav")}
                onClick={toggleCollapse}
              ><Building2 size={18} aria-hidden="true" /></Button>
            : <span className="sa-brand__mark"><Building2 size={18} aria-hidden="true" /></span>}
          <span className="sa-brand__word">{t("brandAdmin")}</span>
          <Button className="sa-sidebar__close" aria-label={t("closeNav")} onClick={close}><X size={18} aria-hidden="true" /></Button>
        </div>
        <nav className="sa-nav" aria-label={t("mainMenu")}>
          <p className="sa-nav__heading">{t("platformSection")}</p>
          {navigation.map(({ key, icon: Icon, ...item }) => {
            if (!("href" in item) || !("capability" in item) || !capabilities.includes(item.capability)) {
              return <span key={key} className="sa-nav__link sa-nav__link--disabled" aria-disabled="true" title={`${t(key)} — ${t("navSoon")}`}><Icon size={16} aria-hidden="true" /><span>{t(key)}</span><span className="sa-nav__soon">{t("navSoon")}</span></span>;
            }
            return <Link key={key} href={item.href} className={`sa-nav__link ${pathname.startsWith(item.href) ? "sa-nav__link--active" : ""}`} aria-current={pathname.startsWith(item.href) ? "page" : undefined} title={collapsed ? t(key) : undefined} onClick={close}><Icon size={16} aria-hidden="true" /><span>{t(key)}</span></Link>;
          })}
        </nav>
      </div>
      <SidebarUsage />
    </aside>
  </>;
}

function TopbarSearch({ search, capabilities }: { search: string; capabilities: string[] }) {
  const companyCopy = useCompanyCopy();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t, locale } = usePlatformLocale();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const companies = usePaletteCompanies(open && capabilities.includes("platform.company.read"));
  const jobs = usePaletteJobs(open);

  const range = params.get("range");
  const currentRange = isRange(range) ? range : "30d";

  const go = (next: { range?: string; q?: string; locale?: "id" | "en" }) => {
    if (next.locale) { router.replace(pathname, { locale: next.locale }); return; }
    const query = new URLSearchParams();
    query.set("range", next.range ?? currentRange);
    const term = next.q === undefined ? search : next.q;
    if (term.trim()) query.set("q", term.trim().slice(0, 100));
    router.replace(`/superadmin/dashboard?${query.toString()}`);
  };

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const entries: PaletteEntry[] = [
    { id: "page-dashboard", group: "pages", label: t("dashboard"), hint: t("pageDashboardHint"), icon: <LayoutDashboard size={15} aria-hidden="true" />, run: () => go({}) },
    ...(capabilities.includes("platform.company.read") ? [{ id: "page-companies", group: "pages" as const, label: t("company"), icon: <Building2 size={15} aria-hidden="true" />, run: () => router.push("/superadmin/companies") }] : []),
    ...(capabilities.includes("platform.company.read") ? companies.data?.items ?? [] : []).map((item) => ({
      id: `company-${item.id}`,
      group: "companies" as const,
      label: item.name,
      hint: [item.subscription_plan, companyCopy[item.status]].filter(Boolean).join(" · "),
      icon: <Building2 size={15} aria-hidden="true" />,
      run: () => router.push(`/superadmin/companies/${item.id}`),
    })),
    ...(jobs.data?.items ?? []).map((item) => ({
      id: `job-${item.id}`,
      group: "processes" as const,
      label: jobType(item.type, locale),
      hint: [item.company_name ?? t("noCompany"), item.status === "failed" ? t("failed") : t("retryPending")].join(" · "),
      icon: <Workflow size={15} aria-hidden="true" />,
      run: () => go({ q: item.company_name ?? jobType(item.type, locale) }),
    })),
    { id: "theme-light", group: "actions", label: t("themeLight"), icon: <Sun size={15} aria-hidden="true" />, run: () => updateTheme("light") },
    { id: "theme-dark", group: "actions", label: t("themeDark"), icon: <Moon size={15} aria-hidden="true" />, run: () => updateTheme("dark") },
    { id: "theme-system", group: "actions", label: t("themeSystem"), icon: <Laptop size={15} aria-hidden="true" />, run: () => updateTheme("system") },
    { id: "locale-id", group: "actions", label: t("languageId"), hint: locale === "id" ? t("current") : undefined, icon: <Languages size={15} aria-hidden="true" />, run: () => go({ locale: "id" }) },
    { id: "locale-en", group: "actions", label: t("languageEn"), hint: locale === "en" ? t("current") : undefined, icon: <Languages size={15} aria-hidden="true" />, run: () => go({ locale: "en" }) },
    ...(["7d", "30d", "90d", "12m"] as const).map((value) => ({
      id: `range-${value}`,
      group: "actions" as const,
      label: t("rangeAction").replace("{value}", t(value === "7d" ? "days7" : value === "30d" ? "days30" : value === "90d" ? "days90" : "months12")),
      hint: currentRange === value ? t("current") : undefined,
      icon: <CalendarDays size={15} aria-hidden="true" />,
      run: () => go({ range: value }),
    })),
  ];

  return <div className="sa-search" role="search">
    <button
      ref={triggerRef}
      type="button"
      className="sa-search__trigger"
      aria-label={t("searchLabel")}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
    >
      <Search size={15} aria-hidden="true" />
      <span className="sa-search__placeholder">{t("searchPlaceholder")}</span>
      <kbd className="sa-search__kbd" aria-hidden="true">⌘K</kbd>
    </button>
    {search && <Button className="sa-search__clear" aria-label={t("clearSearch")} onClick={() => go({ q: "" })}><X size={15} aria-hidden="true" /></Button>}
    <CommandPalette open={open} onClose={() => { setOpen(false); triggerRef.current?.focus(); }} entries={entries} onFilter={(term) => go({ q: term })} />
  </div>;
}

function ProfileMenu({ email }: { email: string | null }) {
  const router = useRouter();
  const { t } = usePlatformLocale();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);
  const { message, dismiss, notify } = useNoticeToast();

  useEffect(() => {
    if (!open) return;
    itemRef.current?.focus();
    const dismissOnPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", dismissOnPointer);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointer);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function signOut() {
    setPending(true);
    dismiss();
    try { await logout(); router.replace("/login"); router.refresh(); }
    catch { notify(t("signOutError")); setPending(false); }
  }

  return <div className="sa-profile" ref={rootRef}>
    <button
      ref={triggerRef}
      type="button"
      className="sa-profile__trigger"
      aria-label={t("accountMenu")}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
    >
      <span className="sa-profile__avatar" aria-hidden="true">{email?.slice(0, 1).toUpperCase() ?? "S"}</span>
      <span className="sa-profile__identity"><strong>{email ?? "Superadmin"}</strong><small>{t("accountAccess")}</small></span>
      <ChevronDown size={14} aria-hidden="true" className={`sa-profile__chevron ${open ? "is-open" : ""}`.trim()} />
    </button>
    <AnimatePresence>
      {open ? <motion.div
        className="sa-profile__menu"
        role="menu"
        aria-label={t("platformAccount")}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="sa-profile__caption">{t("platformAccount")}</p>
        <Button ref={itemRef} className="sa-profile__action" role="menuitem" onClick={signOut} busy={pending}>
          <LogOut size={15} aria-hidden="true" /><span>{t("signOut")}</span>
        </Button>
      </motion.div> : null}
    </AnimatePresence>
    <NoticeToast message={message} onDismiss={dismiss} dismissLabel={t("dismiss")} />
  </div>;
}

export function Topbar({ email, toggleNav, open, capabilities = [] }: { email: string | null; toggleNav: () => void; open: boolean; capabilities?: string[] }) {
  const params = useSearchParams();
  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const { t } = usePlatformLocale();
  return <header className="sa-topbar">
    <Button className="sa-menu-mobile" aria-label={t("openNav")} aria-expanded={open} aria-controls="navigasi-platform" onClick={toggleNav}><Menu size={18} /></Button>
    <div className="sa-topbar__leading"><TopbarSearch key={search} search={search} capabilities={capabilities} /></div>
    <div className="sa-topbar__actions"><NotificationBell /><LocaleControl /><ThemeControl /><ProfileMenu email={email} /></div>
  </header>;
}

export function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const { t } = usePlatformLocale();
  const operator = useOperator();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // Collapsing is a desktop-only affordance; the drawer is already compact on small screens.
  const [collapsible, setCollapsible] = useState(true);
  usePointerGlow();
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setCollapsible(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!operator.data) return;
    const controller = new AbortController();
    fetch("/api/v1/auth/me", { credentials: "same-origin", cache: "no-store", redirect: "error", signal: controller.signal })
      .then((res) => res.ok ? res.json() : null).then((data) => { if (typeof data?.email === "string") setEmail(data.email); }).catch(() => {});
    return () => controller.abort();
  }, [operator.data]);
  useEffect(() => {
    if (!open) return;
    const sidebar = document.getElementById("navigasi-platform");
    const trigger = document.querySelector<HTMLButtonElement>(".sa-menu-mobile");
    const workspace = document.querySelector<HTMLElement>(".sa-workspace");
    const skip = document.querySelector<HTMLElement>(".sa-shell > .skip-link");
    if (!sidebar) return;
    if (workspace) workspace.inert = true;
    if (skip) skip.inert = true;
    const focusable = () => Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const controls = focusable();
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const onViewportChange = () => { if (media.matches) setOpen(false); };
    document.addEventListener("keydown", keydown);
    media.addEventListener("change", onViewportChange);
    onViewportChange();
    return () => {
      document.removeEventListener("keydown", keydown);
      media.removeEventListener("change", onViewportChange);
      if (workspace) workspace.inert = false;
      if (skip) skip.inert = false;
      if (!media.matches) trigger?.focus();
    };
  }, [open]);
  if (operator.isPending) return <div className="sa-shell-loading" role="status">{t("verifying")}</div>;
  if (operator.error) return <div className="sa-shell-loading"><ShieldCheck size={28} aria-hidden="true" /><h1>{operator.error instanceof Error && "status" in operator.error && operator.error.status === 403 ? t("forbidden") : t("verifyError")}</h1><Button onClick={() => operator.refetch()}>{t("retry")}</Button></div>;
  if (!operator.data?.mfa_verified || !operator.data.capabilities.includes("platform.dashboard.read")) return <div className="sa-shell-loading"><h1>{t("forbidden")}</h1></div>;
  return <div className={`sa-shell ${collapsed ? "sa-shell--collapsed" : ""}`}>
    <a href="#konten-utama" className="skip-link">{t("skipNav")}</a>
    <SidebarNavigation open={open} collapsed={collapsed} close={() => setOpen(false)} toggleCollapse={() => setCollapsed((value) => !value)} capabilities={operator.data.capabilities} collapsible={collapsible} />
    <div className="sa-workspace"><Topbar email={email} open={open} capabilities={operator.data.capabilities} toggleNav={() => setOpen(true)} /><main id="konten-utama" className="sa-main" tabIndex={-1}>{children}</main></div>
  </div>;
}
