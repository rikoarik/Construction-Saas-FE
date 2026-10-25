"use client";

import { AlertTriangle, CheckCircle2, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function RealityComparison() {
  const t = useTranslations("landing.reality");

  return (
    <section id="reality" className="landing-section reality-section" aria-labelledby="reality-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="reality-heading" className="section-title">
            {t("title")}
          </h2>
          <p className="section-description">{t("description")}</p>
        </div>

        <div className="reality-grid">
          {/* Column 1: Traditional Chaos */}
          <div className="reality-column reality-column--chaos">
            <header className="reality-column__header">
              <span className="reality-column__icon reality-column__icon--chaos" aria-hidden="true">
                <FileSpreadsheet size={18} />
              </span>
              <h3>{t("chaosTitle")}</h3>
            </header>

            <div className="reality-cards">
              <article className="reality-card reality-card--chaos">
                <div className="reality-card__indicator" aria-hidden="true">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("chaos1Title")}</h4>
                  <p className="reality-card__text">{t("chaos1Desc")}</p>
                </div>
              </article>

              <article className="reality-card reality-card--chaos">
                <div className="reality-card__indicator" aria-hidden="true">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("chaos2Title")}</h4>
                  <p className="reality-card__text">{t("chaos2Desc")}</p>
                </div>
              </article>

              <article className="reality-card reality-card--chaos">
                <div className="reality-card__indicator" aria-hidden="true">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("chaos3Title")}</h4>
                  <p className="reality-card__text">{t("chaos3Desc")}</p>
                </div>
              </article>
            </div>
          </div>

          {/* Column 2: Unified Construction Ledger */}
          <div className="reality-column reality-column--ledger">
            <header className="reality-column__header">
              <span className="reality-column__icon reality-column__icon--ledger" aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <h3>{t("ledgerTitle")}</h3>
            </header>

            <div className="reality-cards">
              <article className="reality-card reality-card--ledger">
                <div className="reality-card__indicator" aria-hidden="true">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("ledger1Title")}</h4>
                  <p className="reality-card__text">{t("ledger1Desc")}</p>
                </div>
              </article>

              <article className="reality-card reality-card--ledger">
                <div className="reality-card__indicator" aria-hidden="true">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("ledger2Title")}</h4>
                  <p className="reality-card__text">{t("ledger2Desc")}</p>
                </div>
              </article>

              <article className="reality-card reality-card--ledger">
                <div className="reality-card__indicator" aria-hidden="true">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="reality-card__title">{t("ledger3Title")}</h4>
                  <p className="reality-card__text">{t("ledger3Desc")}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}