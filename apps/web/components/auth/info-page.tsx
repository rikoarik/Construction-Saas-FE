import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "./info-page.css";

type InfoPageKind = "support" | "privacy" | "terms";

export function InfoPage({ kind }: { kind: InfoPageKind }) {
  const t = useTranslations("auth");
  const title = kind === "support" ? t("needHelp") : kind === "privacy" ? t("privacyPolicy") : t("termsOfService");
  const description = kind === "support" ? t("helpMessage") : kind === "privacy" ? t("privacyUnavailable") : t("termsUnavailable");

  return (
    <main className="info-page">
      <header className="info-header"><Link href="/">{t("brand")}</Link></header>
      <article className="info-content">
        <Link className="info-back" href="/login">← {t("backToLogin")}</Link>
        <p className="info-label">{kind === "support" ? t("supportLabel") : t("legalLabel")}</p>
        <h1>{title}</h1>
        <p className="info-description">{description}</p>
      </article>
    </main>
  );
}
