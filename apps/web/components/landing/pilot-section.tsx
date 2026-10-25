"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface PilotSectionProps { onRequestPilot: () => void; }

export function PilotSection({ onRequestPilot }: PilotSectionProps) {
  const t = useTranslations("landing.pilot");

  return (
    <section id="pilot" className="landing-section pilot-section" aria-labelledby="pilot-heading">
      <div className="landing-container">
        <motion.div className="pilot-panel" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
          <div className="pilot-panel__copy">
            <div className="eyebrow">{t("eyebrow")}</div>
            <h2 id="pilot-heading">{t("title")}</h2>
            <p>{t("description")}</p>
            <button type="button" className="button button--primary" onClick={onRequestPilot}>
              {t("tier1Cta")}<span className="button__icon" aria-hidden="true"><ArrowRight size={16} /></span>
            </button>
          </div>
          <div className="pilot-panel__details">
            <div className="pilot-panel__label"><span>{t("tier1Badge")}</span><span>{t("tier1Price")}</span></div>
            <ul aria-label={t("pilotFeaturesAria")}>
              {[1, 2, 3, 4, 5].map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{t(`tier1F${item}`)}</span></li>)}
            </ul>
            <button type="button" className="pilot-panel__enterprise" onClick={onRequestPilot}><span>{t("tier2Cta")}</span><ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
