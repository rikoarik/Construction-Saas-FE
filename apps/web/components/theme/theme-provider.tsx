"use client";

import { useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

type ThemePreference = "light" | "dark" | "system";

type ThemeSnapshot = {
  preference: ThemePreference;
  resolved: "light" | "dark";
};

const THEME_STORAGE_KEY = "construction-saas-theme";
const THEME_COOKIE_KEY = "construction-saas-theme";
const SERVER_THEME: ThemeSnapshot = { preference: "system", resolved: "light" };
let serverTheme = SERVER_THEME;

const listeners = new Set<() => void>();
let currentTheme = SERVER_THEME;
let systemTheme: "light" | "dark" = "light";
let mediaQuery: MediaQueryList | undefined;

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readSavedPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(preference: ThemePreference): ThemeSnapshot {
  return {
    preference,
    resolved: preference === "system" ? systemTheme : preference,
  };
}

function applyTheme(theme: ThemeSnapshot) {
  document.documentElement.dataset.theme = theme.resolved;
  document.documentElement.style.colorScheme = theme.resolved;
}

function setThemeCookie(preference: ThemePreference) {
  try {
    document.cookie = `${THEME_COOKIE_KEY}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    // Cookie persistence is optional; current page state still changes.
  }
}

function initializeTheme() {
  if (typeof window === "undefined" || mediaQuery) return;

  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemTheme = mediaQuery.matches ? "dark" : "light";
  currentTheme = resolveTheme(readSavedPreference());
  applyTheme(currentTheme);
  const syncPreference = (preference: ThemePreference) => {
    currentTheme = resolveTheme(preference);
    applyTheme(currentTheme);
    listeners.forEach((listener) => listener());
  };
  mediaQuery.addEventListener("change", (event) => {
    systemTheme = event.matches ? "dark" : "light";
    if (currentTheme.preference === "system") syncPreference("system");
  });
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      syncPreference(readSavedPreference());
    }
  });
}

initializeTheme();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentTheme;
}

function getServerSnapshot() {
  return serverTheme;
}

function updateTheme(preference: ThemePreference) {
  currentTheme = resolveTheme(preference);
  applyTheme(currentTheme);
  listeners.forEach((listener) => listener());
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Local storage can be unavailable; the current document still reflects the preference.
  }
  setThemeCookie(preference);
}

export function ThemeProvider({ children, initialTheme = "system" }: { children: React.ReactNode; initialTheme?: ThemePreference }) {
  const serverResolved = initialTheme === "system" ? "light" : initialTheme;
  serverTheme = { preference: initialTheme, resolved: serverResolved };
  if (typeof window === "undefined") currentTheme = serverTheme;
  else if (!mediaQuery) currentTheme = serverTheme;
  return children;
}

export function ThemeControl() {
  const t = useTranslations("common");
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <fieldset className="theme-control" aria-label={t("theme")}>
      <legend className="sr-only">{t("theme")}</legend>
      <button
        aria-label={t("light")}
        aria-pressed={preference.preference === "light"}
        className="theme-control__button"
        onClick={() => updateTheme("light")}
        type="button"
      >
        <Sun aria-hidden="true" size={16} />
      </button>
      <button
        aria-label={t("dark")}
        aria-pressed={preference.preference === "dark"}
        className="theme-control__button"
        onClick={() => updateTheme("dark")}
        type="button"
      >
        <Moon aria-hidden="true" size={16} />
      </button>
      <button
        aria-label={t("system")}
        aria-pressed={preference.preference === "system"}
        className="theme-control__button"
        onClick={() => updateTheme("system")}
        type="button"
      >
        <Laptop aria-hidden="true" size={16} />
      </button>
    </fieldset>
  );
}
