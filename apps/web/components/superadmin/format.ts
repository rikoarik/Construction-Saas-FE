import type { Activities, Jobs } from "@/lib/api/platform-dashboard";

type Locale = "id" | "en";
const language = (locale: Locale) => locale === "en" ? "en-US" : "id-ID";
export const number = (value: number, locale: Locale = "id") => new Intl.NumberFormat(language(locale)).format(value);
export const percent = (value: number, locale: Locale = "id") => new Intl.NumberFormat(language(locale), { maximumFractionDigits: 1 }).format(value) + "%";
/** Compact magnitudes for counts too large to read as digits in a narrow column. */
export const compact = (value: number, locale: Locale = "id") => new Intl.NumberFormat(language(locale), { notation: "compact", maximumFractionDigits: 1 }).format(value);
export const date = (value: string, locale: Locale = "id") => new Intl.DateTimeFormat(language(locale), { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
export const dateTime = (value: string, locale: Locale = "id") => new Intl.DateTimeFormat(language(locale), { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) + " UTC";
export const bytes = (value: number, locale: Locale = "id") => {
  const unit = value >= 1e12 ? "TB" : value >= 1e9 ? "GB" : value >= 1e6 ? "MB" : "B";
  const divisor = unit === "TB" ? 1e12 : unit === "GB" ? 1e9 : unit === "MB" ? 1e6 : 1;
  return new Intl.NumberFormat(language(locale), { maximumFractionDigits: 1 }).format(value / divisor) + " " + unit;
};
export function relativeTime(value: string, now: number, locale: Locale = "id"): string {
  if (now === 0) return date(value, locale);
  const seconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return locale === "en" ? "Just now" : "Baru saja";
  const [amount, unit] = seconds < 3600 ? [Math.floor(seconds / 60), "minute"] as const : seconds < 86400 ? [Math.floor(seconds / 3600), "hour"] as const : [Math.floor(seconds / 86400), "day"] as const;
  if (locale === "en") return `${number(amount, locale)} ${unit}${amount === 1 ? "" : "s"} ago`;
  return `${number(amount, locale)} ${{ minute: "menit", hour: "jam", day: "hari" }[unit]} lalu`;
}
export function activityTitle(type: Activities["items"][number]["type"], locale: Locale = "id"): string {
  const titles = locale === "en"
    ? { "company.registered": "Company registered", "company.suspended": "Company suspended", "company.reactivated": "Company reactivated", "subscription.changed": "Subscription updated", "job.failed": "Process failed" }
    : { "company.registered": "Perusahaan terdaftar", "company.suspended": "Perusahaan ditangguhkan", "company.reactivated": "Perusahaan diaktifkan kembali", "subscription.changed": "Langganan diperbarui", "job.failed": "Proses gagal" };
  return titles[type] ?? (locale === "en" ? "Platform activity" : "Aktivitas platform");
}
export function jobType(type: Jobs["items"][number]["type"], locale: Locale = "id"): string {
  const titles: Record<string, string> = locale === "en" ? { "email.delivery": "Email delivery", "telegram.delivery": "Telegram delivery" } : { "email.delivery": "Pengiriman email", "telegram.delivery": "Pengiriman Telegram" };
  return titles[type] ?? (locale === "en" ? "System process" : "Proses sistem");
}
