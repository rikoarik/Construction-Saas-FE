"use client";

import { FileCheck2, FileSpreadsheet, GitPullRequest, Smartphone, Workflow } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

const icons = [FileSpreadsheet, Smartphone, Workflow, FileCheck2, GitPullRequest];

export function CapabilityPillars() {
  const t = useTranslations("landing.pillars");

  return (
    <section id="capabilities" className="landing-section pillars-section" aria-labelledby="pillars-heading">
      <div className="landing-container pillars-layout">
        <motion.div className="pillars-intro" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="pillars-heading" className="section-title">{t("title")}</h2>
          <p className="section-description">{t("description")}</p>
          <div className="pillars-intro__line" aria-hidden="true"><span>01</span><span>05</span></div>
        </motion.div>
        <div className="pillars-list">
          {icons.map((Icon, index) => {
            const item = index + 1;
            return (
              <motion.article className="pillar-row" key={item} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                <span className="pillar-row__number">0{item}</span>
                <span className="pillar-row__icon" aria-hidden="true"><Icon size={19} strokeWidth={1.75} /></span>
                <div><h3>{t(`p${item}Title`)}</h3><p>{t(`p${item}Desc`)}</p></div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
