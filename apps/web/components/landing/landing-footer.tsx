"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const common = useTranslations("common");

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer__statement"><span>{t("closingLabel")}</span><p>{t("brandDesc")}</p></div>
        <div className="landing-footer__main">
          <Link href="/" className="landing-brand"><span className="landing-brand__symbol" aria-hidden="true"><i /><i /><i /></span><span>{common("brand")}</span></Link>
          <nav aria-label={t("navigationAria")}><a href="#reality">{t("navReality")}</a><a href="#product-ui">{t("navLedger")}</a><a href="#integrity">{t("navCapabilities")}</a><a href="#pilot">{t("navPilot")}</a></nav>
        </div>
        <div className="landing-footer__bottom"><span>© {new Date().getFullYear()} {common("brand")}</span><span>{t("factoryCredit")}</span><span>{t("rights")}</span><a href="#main-content">{t("backToTop")}</a></div>
      </div>
    </footer>
  );
}
