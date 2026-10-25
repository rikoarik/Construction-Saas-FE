"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  onRequestPilot: () => void;
}

export function HeroSection({ onRequestPilot }: HeroSectionProps) {
  const t = useTranslations("landing.hero");

  return (
    <section className="landing-hero" aria-labelledby="hero-heading">
      <div className="landing-container">
        <div className="landing-hero__frame">
          <div className="landing-hero__header">
            <span className="landing-hero__badge">
              <span className="landing-hero__badge-dot" aria-hidden="true" />
              {t("badge")}
            </span>
          </div>

          <div className="landing-hero__body">
            <h1 id="hero-heading" className="landing-hero__title">
              {t("title")}
            </h1>
            <p className="landing-hero__subtitle">{t("subtitle")}</p>

            <div className="landing-hero__actions">
              <a href="#interactive-ledger" className="button button--primary landing-hero__cta-primary">
                <span>{t("ctaPrimary")}</span>
                <ArrowDown size={15} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="button button--secondary landing-hero__cta-secondary"
                onClick={onRequestPilot}
              >
                <span>{t("ctaSecondary")}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Metric KPI strip */}
          <div className="landing-hero__kpi-grid" role="region" aria-label="Key Performance Indicators">
            <div className="kpi-card">
              <div className="kpi-card__value tabular-nums">{t("kpi1Value")}</div>
              <div className="kpi-card__label">{t("kpi1Label")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__value tabular-nums">{t("kpi2Value")}</div>
              <div className="kpi-card__label">{t("kpi2Label")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__value tabular-nums">{t("kpi3Value")}</div>
              <div className="kpi-card__label">{t("kpi3Label")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__value tabular-nums">{t("kpi4Value")}</div>
              <div className="kpi-card__label">{t("kpi4Label")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}