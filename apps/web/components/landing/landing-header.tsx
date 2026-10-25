"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

interface LandingHeaderProps { onRequestPilot: () => void; }

export function LandingHeader({ onRequestPilot }: LandingHeaderProps) {
  const t = useTranslations("landing.nav");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
  const links = [{ href: "#reality", label: t("reality") }, { href: "#interactive-ledger", label: t("interactive") }, { href: "#capabilities", label: t("capabilities") }, { href: "#integrity", label: t("integrity") }];

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className="landing-header">
      <div className="landing-container landing-header__inner">
        <Link href="/" className="landing-brand" onClick={() => setOpen(false)} aria-label={common("brand")}>
          <span className="landing-brand__symbol" aria-hidden="true"><i /><i /><i /></span>
          <span>{common("brand")}</span>
        </Link>
        <nav className="landing-nav" aria-label={common("mainNavigation")}><ul>{links.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></nav>
        <div className="landing-header__controls">
          <div className="landing-header__preferences"><LocaleControl /><ThemeControl /></div>
          <button type="button" className="button button--primary landing-header__cta" onClick={onRequestPilot}>{t("requestPilot")}<ArrowUpRight size={15} aria-hidden="true" /></button>
          <button type="button" className="landing-header__menu" aria-expanded={open} aria-controls="landing-mobile-menu" aria-label={open ? common("closeNavigation") : common("openNavigation")} onClick={() => setOpen(!open)}>{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <div id="landing-mobile-menu" className="landing-header__mobile">
        <nav className="landing-container" aria-label={common("mobileNavigation")}>
          {links.map((link, index) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{link.label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
          <a href="#pilot" onClick={() => setOpen(false)}><span>05</span>{t("pilot")}<ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href="#faq" onClick={() => setOpen(false)}><span>06</span>{t("faq")}<ArrowUpRight size={17} aria-hidden="true" /></a>
          <div className="landing-header__mobile-controls"><LocaleControl /><ThemeControl /></div>
          <button type="button" className="button button--primary" onClick={() => { setOpen(false); onRequestPilot(); }}>{t("requestPilot")}</button>
        </nav>
      </div>}
    </header>
  );
}
