"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HomePage } from "@/components/layout/home-page";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function AppPage() {
  return (
    <ThemeProvider>
      <AppShell>
        <HomePage />
      </AppShell>
    </ThemeProvider>
  );
}