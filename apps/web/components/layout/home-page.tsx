"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ClipboardList, FolderKanban } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function HomePage() {
  const t = useTranslations("home");
  const common = useTranslations("common");

  return (
    <div className="overview-page">
      <header className="page-heading">
        <div>
          <div className="eyebrow">{t("eyebrow")}</div>
          <h1>{t("title")}</h1>
          <p className="page-heading__description">{t("description")}</p>
        </div>
        <div className="page-heading__actions">
          <Link className="button button--secondary" href="/reports">
            <ClipboardList aria-hidden="true" size={16} />
            {t("secondaryAction")}
          </Link>
          <Link className="button button--primary" href="/projects">
            {t("primaryAction")}
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <section aria-labelledby="projects-heading" className="projects-section">
        <div className="section-heading">
          <div>
            <h2 id="projects-heading">{t("recentProjects")}</h2>
            <p>{t("emptyDescription")}</p>
          </div>
          <Link className="text-link" href="/projects">
            {t("viewAll")}
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="empty-state">
          <span aria-hidden="true" className="empty-state__icon">
            <FolderKanban size={21} strokeWidth={1.7} />
          </span>
          <h3>{t("emptyTitle")}</h3>
          <p>{t("emptyDescription")}</p>
          <Link className="button button--secondary" href="/projects">
            {t("primaryAction")}
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </section>

      <footer className="overview-footer">
        <span>{common("brand")}</span>
        <span>{t("scopeLabel")}</span>
      </footer>
    </div>
  );
}
