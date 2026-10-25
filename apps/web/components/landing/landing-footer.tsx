"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleControl } from "@/components/theme/locale-control";
import { ThemeControl } from "@/components/theme/theme-provider";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const common = useTranslations("common");

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer__top">
          <div className="landing-footer__brand-block">
            <div className="landing-brand">
              <span className="brand__mark" aria-hidden="true">
                {common("brandMark")}
              </span>
              <span className="landing-brand__text">{common("brand")}</span>
            </div>
            <p className="landing-footer__tagline">{t("brandDesc")}</p>
            <div className="landing-footer__status">
              <span className="status-dot status-dot--positive" aria-hidden="true" />
              <span>{t("statusOperational")}</span>
            </div>
          </div>

          <div className="landing-footer__nav-cols">
            <div className="footer-col">
              <h4 className="footer-col__title">Product Engine</h4>
              <ul className="footer-col__list">
                <li><a href="#reality">Operational Reality</a></li>
                <li><a href="#interactive-ledger">Live Ledger Simulation</a></li>
                <li><a href="#capabilities">Core Capabilities</a></li>
                <li><a href="#integrity">PostgreSQL Integrity</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col__title">Pilot & Deployment</h4>
              <ul className="footer-col__list">
                <li><a href="#pilot">2-Project Evaluation</a></li>
                <li><a href="#pilot">Enterprise Fleet Rollout</a></li>
                <li><a href="#faq">Contractor FAQ</a></li>
                <li><Link href="/app">Product Workspace</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col__title">System Controls</h4>
              <div className="footer-controls">
                <LocaleControl />
                <ThemeControl />
              </div>
              <div className="footer-spec-badge font-mono">{t("specLabel")}</div>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} {common("brand")}. {t("rights")}
          </p>
          <div className="footer-legal-links">
            <span className="footer-legal-link">{t("terms")}</span>
            <span className="footer-separator" aria-hidden="true">·</span>
            <span className="footer-legal-link">{t("privacy")}</span>
            <span className="footer-separator" aria-hidden="true">·</span>
            <span className="footer-legal-link">{t("architectureDoc")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}