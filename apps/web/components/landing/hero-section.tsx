"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("landing.blueprint");

  return (
    <section className="blueprint-hero" aria-labelledby="hero-heading">
      <div className="landing-container blueprint-hero__intro">
        <div className="blueprint-hero__copy">
          <p className="blueprint-hero__folio">{t("folio")}</p>
          <h1 id="hero-heading">{t("title")}</h1>
          <p className="blueprint-hero__lead">{t("lead")}</p>
          <div className="blueprint-hero__actions">
            <a className="button button--primary" href="#product-ui">{t("tryCta")}</a>
            <a className="blueprint-hero__quiet-link" href="#pilot">{t("demoCta")}</a>
          </div>
        </div>
        <div className="blueprint-hero__visual">
          <figure className="blueprint-hero__photo">
            <Image src="/images/hero-construction-team.jpg" alt={t("photoAlt")} fill sizes="(max-width: 900px) 100vw, 46vw" preload />
            <figcaption>{t("photoCaption")}</figcaption>
          </figure>
          <div className="blueprint-hero__survey" aria-hidden="true"><span /><span /><span /></div>
          <div className="blueprint-hero__ledger" aria-label={t("ledgerAria")}>
            <div className="blueprint-hero__ledger-head"><span>{t("ledgerLabel")}</span><span>{t("sampleLabel")}</span></div>
            <div className="blueprint-hero__ledger-title">{t("sampleProject")}</div>
            <dl>
              <div><dt>{t("plan")}</dt><dd>{t("planValue")}</dd></div>
              <div><dt>{t("approved")}</dt><dd>{t("approvedValue")}</dd></div>
              <div><dt>{t("difference")}</dt><dd>{t("differenceValue")}</dd></div>
            </dl>
            <p>{t("ledgerNote")}</p>
          </div>
        </div>
      </div>
      <div className="landing-container blueprint-hero__foot"><span>{t("footLeft")}</span><span>{t("footRight")}</span></div>
    </section>
  );
}
