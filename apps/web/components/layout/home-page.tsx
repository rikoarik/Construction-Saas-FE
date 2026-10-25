"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/illustrations/empty-state";
import { ProjectEmptyIllustration } from "@/components/illustrations/project-empty-illustration";

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
        <EmptyState
          action={(
            <Link className="button button--secondary" href="/projects">
              {t("primaryAction")}
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          )}
          description={t("emptyDescription")}
          illustration={<ProjectEmptyIllustration className="project-empty-illustration" />}
          title={t("emptyTitle")}
        />
      </section>

      <footer className="overview-footer">
        <span>{common("brand")}</span>
        <span>{t("scopeLabel")}</span>
      </footer>
    </div>
  );
}
