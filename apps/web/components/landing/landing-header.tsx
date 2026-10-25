"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

interface LandingHeaderProps {
  onRequestPilot: () => void;
}

export function LandingHeader({ onRequestPilot }: LandingHeaderProps) {
  const t = useTranslations("landing.nav");
  const common = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="landing-header">
      <div className="landing-container landing-header__inner">
        <Link href="/" className="landing-brand" onClick={closeMobileMenu}>
          <span className="brand__mark" aria-hidden="true">
            {common("brandMark")}
          </span>
          <span className="landing-brand__text">{common("brand")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="landing-nav" aria-label="Main Navigation">
          <ul className="landing-nav__list">
            <li>
              <a href="#reality" className="landing-nav__link">
                {t("reality")}
              </a>
            </li>
            <li>
              <a href="#interactive-ledger" className="landing-nav__link">
                {t("interactive")}
              </a>
            </li>
            <li>
              <a href="#capabilities" className="landing-nav__link">
                {t("capabilities")}
              </a>
            </li>
            <li>
              <a href="#integrity" className="landing-nav__link">
                {t("integrity")}
              </a>
            </li>
            <li>
              <a href="#pilot" className="landing-nav__link">
                {t("pilot")}
              </a>
            </li>
            <li>
              <a href="#faq" className="landing-nav__link">
                {t("faq")}
              </a>
            </li>
          </ul>
        </nav>

        {/* Actions & Controls */}
        <div className="landing-header__controls">
          <LocaleControl />
          <ThemeControl />

          <button
            type="button"
            className="button button--secondary landing-header__cta-pilot"
            onClick={onRequestPilot}
          >
            {t("requestPilot")}
          </button>

          <Link
            href="/app"
            className="button button--primary landing-header__cta-app"
          >
            <span>{t("openApp")}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="landing-header__hamburger"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? common("closeNavigation") : common("openNavigation")}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="landing-header__mobile-drawer">
          <div className="landing-container">
            <nav aria-label="Mobile Navigation">
              <ul className="mobile-nav__list">
                <li>
                  <a href="#reality" onClick={closeMobileMenu}>
                    {t("reality")}
                  </a>
                </li>
                <li>
                  <a href="#interactive-ledger" onClick={closeMobileMenu}>
                    {t("interactive")}
                  </a>
                </li>
                <li>
                  <a href="#capabilities" onClick={closeMobileMenu}>
                    {t("capabilities")}
                  </a>
                </li>
                <li>
                  <a href="#integrity" onClick={closeMobileMenu}>
                    {t("integrity")}
                  </a>
                </li>
                <li>
                  <a href="#pilot" onClick={closeMobileMenu}>
                    {t("pilot")}
                  </a>
                </li>
                <li>
                  <a href="#faq" onClick={closeMobileMenu}>
                    {t("faq")}
                  </a>
                </li>
              </ul>
            </nav>
            <div className="mobile-drawer__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  closeMobileMenu();
                  onRequestPilot();
                }}
              >
                {t("requestPilot")}
              </button>
              <Link
                href="/app"
                className="button button--primary"
                onClick={closeMobileMenu}
              >
                <span>{t("openApp")}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}