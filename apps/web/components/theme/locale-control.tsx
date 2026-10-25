"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleControl() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="locale-control">
      <Languages aria-hidden="true" size={16} />
      <label className="sr-only" htmlFor="locale-select">
        {t("language")}
      </label>
      <select
        id="locale-select"
        onChange={(event) => router.replace(pathname, { locale: event.target.value })}
        value={locale}
      >
        <option value="en">{t("english")}</option>
        <option value="id">{t("indonesian")}</option>
      </select>
    </div>
  );
}
