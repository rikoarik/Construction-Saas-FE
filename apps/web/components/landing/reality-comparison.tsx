"use client";

import { ArrowRight, Check, FileSpreadsheet, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export function RealityComparison() {
  const t = useTranslations("landing.reality");
  const rows = [1, 2, 3];

  return (
    <section id="reality" className="landing-section reality-section" aria-labelledby="reality-heading">
      <div className="landing-container">
        <motion.div className="section-intro section-intro--split" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="reality-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </motion.div>
        <div className="reality-comparison">
          <div className="reality-comparison__head"><span><FileSpreadsheet size={17} aria-hidden="true" />{t("chaosTitle")}</span><span><Check size={17} aria-hidden="true" />{t("ledgerTitle")}</span></div>
          {rows.map((row) => (
            <motion.div className="reality-comparison__row" key={row} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: row * 0.08 }}>
              <div className="reality-comparison__problem"><X size={16} aria-hidden="true" /><div><h3>{t(`chaos${row}Title`)}</h3><p>{t(`chaos${row}Desc`)}</p></div></div>
              <div className="reality-comparison__solution"><Check size={16} aria-hidden="true" /><div><h3>{t(`ledger${row}Title`)}</h3><p>{t(`ledger${row}Desc`)}</p></div></div>
            </motion.div>
          ))}
        </div>
        <motion.a href="#interactive-ledger" className="reality-next" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <span>{t("nextLabel")}</span><ArrowRight size={18} aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  );
}
