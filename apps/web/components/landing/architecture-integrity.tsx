import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function ArchitectureIntegrity() {
  const t = useTranslations("landing.integrity");

  return (
    <section id="integrity" className="landing-section integrity-section" data-sc-act="flow" aria-labelledby="integrity-heading">
      <div className="landing-container">
        <div className="section-intro section-intro--split">
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="integrity-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </div>
        <div className="integrity-ledger">
          {[1, 2, 3].map((item) => <article className="integrity-ledger__row" data-sc-in key={item}>
            <span className="integrity-ledger__number">0{item}</span>
            <div><h3>{t(`f${item}Title`)}</h3><p>{t(`f${item}Desc`)}</p></div>
            <div className="integrity-ledger__spec"><ArrowDown size={15} aria-hidden="true" /><span>{t(`f${item}Spec`)}</span></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
