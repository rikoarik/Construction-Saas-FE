"use client";

import { Binary, Database, Lock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export function ArchitectureIntegrity() {
  const t = useTranslations("landing.integrity");
  const specs = [
    { icon: Binary, title: t("f1Title"), desc: t("f1Desc"), detail: t("f1Spec") },
    { icon: Database, title: t("f2Title"), desc: t("f2Desc"), detail: t("f2Spec") },
    { icon: Lock, title: t("f3Title"), desc: t("f3Desc"), detail: t("f3Spec") },
    { icon: ShieldCheck, title: t("f4Title"), desc: t("f4Desc"), detail: t("f4Spec") },
  ];

  return (
    <section id="integrity" className="landing-section integrity-section" aria-labelledby="integrity-heading">
      <div className="landing-container">
        <motion.div className="section-intro section-intro--split" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="integrity-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </motion.div>
        <div className="integrity-grid">
          {specs.map((item, index) => {
            const Icon = item.icon;
            return <motion.article className="integrity-card" key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.06 }}>
              <div className="integrity-card__top"><Icon size={20} strokeWidth={1.75} aria-hidden="true" /><span>0{index + 1}</span></div>
              <h3>{item.title}</h3><p>{item.desc}</p><div className="integrity-card__spec">{item.detail}</div>
            </motion.article>;
          })}
        </div>
      </div>
    </section>
  );
}
