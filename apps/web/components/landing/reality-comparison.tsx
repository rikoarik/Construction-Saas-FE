import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function RealityComparison() {
  const t = useTranslations("landing.reality");

  return (
    <section id="reality" className="landing-section reality-section" aria-labelledby="reality-heading">
      <div className="landing-container">
        <div className="section-intro section-intro--split">
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="reality-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </div>
        <div className="reality-comparison">
          <div className="reality-comparison__head"><span>{t("chaosTitle")}</span><span>{t("ledgerTitle")}</span></div>
          {[1, 2, 3].map((row) => (
            <div className="reality-comparison__row" key={row}>
              <span className="reality-comparison__index" aria-hidden="true">0{row}</span>
              <div className="reality-comparison__problem"><h3>{t(`chaos${row}Title`)}</h3><p>{t(`chaos${row}Desc`)}</p></div>
              <div className="reality-comparison__solution"><h3>{t(`ledger${row}Title`)}</h3><p>{t(`ledger${row}Desc`)}</p></div>
            </div>
          ))}
        </div>
        <a href="#product-ui" className="reality-next"><span>{t("nextLabel")}</span><ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
