"use client";

import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  return (
    <section id="faq" className="landing-section faq-section" aria-labelledby="faq-heading">
      <div className="landing-container faq-layout">
        <motion.div className="faq-intro" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div className="eyebrow">{t("eyebrow")}</div><h2 id="faq-heading" className="section-title">{t("title")}</h2><p>{t("description")}</p></motion.div>
        <div className="faq-list">
          {[1, 2, 3, 4, 5].map((item, index) => <motion.details key={item} className="faq-item" name="faq-group" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
            <summary><span className="faq-item__number">0{item}</span><span>{t(`q${item}`)}</span><Plus size={18} aria-hidden="true" /></summary><div className="faq-answer"><p>{t(`a${item}`)}</p></div>
          </motion.details>)}
        </div>
      </div>
    </section>
  );
}
