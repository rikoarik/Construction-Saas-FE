"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

export function LandingHeader() {
  const t = useTranslations("landing.nav");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#reality", label: t("reality") },
    { href: "#product-ui", label: t("interactive") },
    { href: "#curve", label: t("curve") },
    { href: "#integrity", label: t("integrity") },
    { href: "#faq", label: t("faq") },
  ];

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
          <Link className="landing-header__login" href="/login">{t("signIn")}</Link>
          <a className="button button--primary landing-header__cta" href="#product-ui">{t("trySimulation")}</a>
          <button type="button" className="landing-header__menu" aria-expanded={open} aria-controls="landing-mobile-menu" aria-label={open ? common("closeNavigation") : common("openNavigation")} onClick={() => setOpen(!open)}>{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <div id="landing-mobile-menu" className="landing-header__mobile">
        <nav className="landing-container" aria-label={common("mobileNavigation")}>
          {links.map((link, index) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{link.label}</a>)}
          <div className="landing-header__mobile-controls"><LocaleControl /><ThemeControl /></div>
          <a className="button button--primary" href="#product-ui" onClick={() => setOpen(false)}>{t("trySimulation")}</a>
        </nav>
      </div>}
    </header>
  );
}
