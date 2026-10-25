"use client";

import {
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  GitPullRequest,
  Smartphone,
  Workflow,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function CapabilityPillars() {
  const t = useTranslations("landing.pillars");

  const pillars = [
    {
      num: t("p1Number"),
      icon: FileSpreadsheet,
      title: t("p1Title"),
      desc: t("p1Desc"),
      specTags: ["XLSX Parsing", "Header Alignment", "WBS Tree 1000+ Items", "Zero-Denominator Check"],
    },
    {
      num: t("p2Number"),
      icon: Smartphone,
      title: t("p2Title"),
      desc: t("p2Desc"),
      specTags: ["Telegram initData", "Signed Payloads", "Offline Cache", "Geotagged Photo Upload"],
    },
    {
      num: t("p3Number"),
      icon: Workflow,
      title: t("p3Title"),
      desc: t("p3Desc"),
      specTags: ["Idempotent Webhooks", "Separation of Duties", "Immutable Ledger", "State Machines"],
    },
    {
      num: t("p4Number"),
      icon: FileCheck2,
      title: t("p4Title"),
      desc: t("p4Desc"),
      specTags: ["Tri-Party Signatories", "Print Theme PDF", "Official Excel", "Physical vs Earned Value"],
    },
    {
      num: t("p5Number"),
      icon: GitPullRequest,
      title: t("p5Title"),
      desc: t("p5Desc"),
      specTags: ["Variation Orders", "Effective Cutover Dates", "Historic Reproducibility", "Locked Baselines"],
    },
  ];

  return (
    <section id="capabilities" className="landing-section pillars-section" aria-labelledby="pillars-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="pillars-heading" className="section-title">
            {t("title")}
          </h2>
          <p className="section-description">{t("description")}</p>
        </div>

        <div className="pillars-list">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.num} className="pillar-row">
                <div className="pillar-row__number font-mono">{pillar.num}</div>
                <div className="pillar-row__content">
                  <div className="pillar-row__header">
                    <span className="pillar-row__icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h3 className="pillar-row__title">{pillar.title}</h3>
                  </div>
                  <p className="pillar-row__description">{pillar.desc}</p>
                  <ul className="pillar-row__tags" aria-label="Technical capabilities">
                    {pillar.specTags.map((tag) => (
                      <li key={tag} className="spec-tag">
                        <CheckCircle2 size={12} aria-hidden="true" />
                        <span>{tag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}