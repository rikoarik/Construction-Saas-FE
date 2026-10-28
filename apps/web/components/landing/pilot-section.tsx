import { ArrowUpRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface PilotSectionProps { onRequestPilot: () => void; }

export function PilotSection({ onRequestPilot }: PilotSectionProps) {
  const t = useTranslations("landing.pilot");

  return (
    <section id="pilot" className="landing-section pilot-section" aria-labelledby="pilot-heading">
      <div className="landing-container">
        <div className="pilot-panel">
          <div className="pilot-panel__copy">
            <div className="eyebrow">{t("eyebrow")}</div>
            <h2 id="pilot-heading">{t("title")}</h2>
            <p>{t("description")}</p>
            <button type="button" className="button button--primary" onClick={onRequestPilot}>{t("tier1Cta")}<ArrowUpRight size={17} aria-hidden="true" /></button>
          </div>
          <div className="pilot-panel__details">
            <div className="pilot-panel__label"><span>{t("tier1Badge")}</span><span>{t("tier1Price")}</span></div>
            <ul aria-label={t("pilotFeaturesAria")}>{[1, 2, 3, 4, 5].map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{t(`tier1F${item}`)}</span></li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
