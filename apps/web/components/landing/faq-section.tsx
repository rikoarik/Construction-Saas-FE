import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  return (
    <section id="faq" className="landing-section faq-section" aria-labelledby="faq-heading">
      <div className="landing-container faq-layout">
        <div className="faq-intro"><div className="eyebrow">{t("eyebrow")}</div><h2 id="faq-heading" className="section-title">{t("title")}</h2><p>{t("description")}</p></div>
        <div className="faq-list">
          {[1, 2, 3, 4, 5].map((item) => <details key={item} className="faq-item" name="faq-group">
            <summary><span className="faq-item__number">0{item}</span><span>{t(`q${item}`)}</span><Plus size={18} aria-hidden="true" /></summary><div className="faq-answer"><p>{t(`a${item}`)}</p></div>
          </details>)}
        </div>
      </div>
    </section>
  );
}
