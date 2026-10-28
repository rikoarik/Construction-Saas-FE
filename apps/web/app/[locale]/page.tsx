"use client";

import { LandingPage } from "@/components/landing/landing-page";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function LocaleHome() {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
}