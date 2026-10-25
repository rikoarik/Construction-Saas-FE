"use client";

import { Binary, Database, Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function ArchitectureIntegrity() {
  const t = useTranslations("landing.integrity");

  const specs = [
    {
      icon: Binary,
      title: t("f1Title"),
      desc: t("f1Desc"),
      specDetail: "PostgreSQL NUMERIC(18,4) + Golang shopspring/decimal",
    },
    {
      icon: Database,
      title: t("f2Title"),
      desc: t("f2Desc"),
      specDetail: "Composite Foreign Keys + Automated Cross-Tenant Negative Tests",
    },
    {
      icon: Lock,
      title: t("f3Title"),
      desc: t("f3Desc"),
      specDetail: "Argon2id (m=64MB, t=3, p=4) + Opaque Revocable Tokens",
    },
    {
      icon: ShieldCheck,
      title: t("f4Title"),
      desc: t("f4Desc"),
      specDetail: "SHA-256 Checksums + Append-Only Transaction Ledger",
    },
  ];

  return (
    <section id="integrity" className="landing-section integrity-section" aria-labelledby="integrity-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="integrity-heading" className="section-title">
            {t("title")}
          </h2>
          <p className="section-description">{t("description")}</p>
        </div>

        <div className="integrity-grid">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article key={idx} className="integrity-card">
                <div className="integrity-card__icon" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <h3 className="integrity-card__title">{item.title}</h3>
                <p className="integrity-card__desc">{item.desc}</p>
                <div className="integrity-card__spec font-mono">{item.specDetail}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}