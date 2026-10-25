"use client";

import { useTranslations } from "next-intl";

export function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="overview-page">
      <header className="page-heading">
        <div>
          <h1>{t("title")}</h1>
          <p className="page-heading__description">{t("description")}</p>
        </div>
      </header>
      <section aria-labelledby="workspace-heading" className="projects-section">
        <div className="section-heading">
          <div>
            <h2 id="workspace-heading">{t("unavailableTitle")}</h2>
            <p>{t("unavailableDescription")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
