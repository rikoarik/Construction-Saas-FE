"use client";

import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface PilotSectionProps {
  onRequestPilot: () => void;
}

export function PilotSection({ onRequestPilot }: PilotSectionProps) {
  const t = useTranslations("landing.pilot");

  return (
    <section id="pilot" className="landing-section pilot-section" aria-labelledby="pilot-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="pilot-heading" className="section-title">
            {t("title")}
          </h2>
          <p className="section-description">{t("description")}</p>
        </div>

        <div className="pilot-grid">
          {/* Card 1: Pilot Evaluation */}
          <article className="pilot-card pilot-card--focused">
            <header className="pilot-card__header">
              <span className="pilot-badge">{t("tier1Badge")}</span>
              <h3 className="pilot-card__title">{t("tier1Title")}</h3>
              <div className="pilot-card__price">{t("tier1Price")}</div>
              <p className="pilot-card__desc">{t("tier1Desc")}</p>
            </header>

            <ul className="pilot-features" aria-label="Pilot program features">
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier1F1")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier1F2")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier1F3")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier1F4")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier1F5")}</span>
              </li>
            </ul>

            <button
              type="button"
              className="button button--primary pilot-card__cta"
              onClick={onRequestPilot}
            >
              <span>{t("tier1Cta")}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>

          {/* Card 2: Enterprise Fleet */}
          <article className="pilot-card">
            <header className="pilot-card__header">
              <span className="pilot-badge pilot-badge--neutral">{t("tier2Badge")}</span>
              <h3 className="pilot-card__title">{t("tier2Title")}</h3>
              <div className="pilot-card__price">{t("tier2Price")}</div>
              <p className="pilot-card__desc">{t("tier2Desc")}</p>
            </header>

            <ul className="pilot-features" aria-label="Enterprise rollout features">
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier2F1")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier2F2")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier2F3")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier2F4")}</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>{t("tier2F5")}</span>
              </li>
            </ul>

            <button
              type="button"
              className="button button--secondary pilot-card__cta"
              onClick={onRequestPilot}
            >
              <span>{t("tier2Cta")}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}