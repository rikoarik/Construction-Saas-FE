import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
// Preserve the existing platform session gate before entering the dashboard.
import "@/components/auth/info-page.css";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("platform");
  const cookie = (await cookies()).get("session");
  if (!cookie) redirect(`/${locale}/login`);

  const origin = process.env.BACKEND_ORIGIN;
  if (!origin) return <main className="info-page"><article className="info-content"><h1>{t("unavailable")}</h1><Link href="/login">{t("back")}</Link></article></main>;
  let response: Response;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Invalid backend origin");
    response = await fetch(`${url.origin}/api/v1/platform/session`, {
      headers: { Cookie: `session=${cookie.value}` }, cache: "no-store", redirect: "error",
    });
  } catch {
    return <main className="info-page"><article className="info-content"><h1>{t("unavailable")}</h1><Link href="/login">{t("back")}</Link></article></main>;
  }
  if (response.status === 401) redirect(`/${locale}/login`);
  if (response.status === 403) return <main className="info-page"><article className="info-content"><h1>{t("forbidden")}</h1><Link href="/">{t("home")}</Link></article></main>;
  let verified = false;
  if (response.status === 200) {
    try {
      const body: unknown = await response.json();
      verified = typeof body === "object" && body !== null && "authenticated" in body && body.authenticated === true && "mfa_verified" in body && body.mfa_verified === true && "capabilities" in body && Array.isArray(body.capabilities) && body.capabilities.includes("platform.access");
    } catch { /* Fail closed on malformed responses. */ }
  }
  if (!verified) return <main className="info-page"><article className="info-content"><h1>{t("unavailable")}</h1><Link href="/login">{t("back")}</Link></article></main>;

  redirect(`/${locale}/superadmin/dashboard`);
}
