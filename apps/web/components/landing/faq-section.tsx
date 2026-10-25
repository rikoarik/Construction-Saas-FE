"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
  ];

  return (
    <section id="faq" className="landing-section faq-section" aria-labelledby="faq-heading">
      <div className="landing-container">
        <div className="section-intro">
          <div className="eyebrow">{t("eyebrow")}</div>
          <h2 id="faq-heading" className="section-title">
            {t("title")}
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={index} className="faq-item" name="faq-group">
              <summary className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}