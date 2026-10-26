"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { RealityComparison } from "./reality-comparison";
import { ProductShowcase } from "./product-showcase";
import { ArchitectureIntegrity } from "./architecture-integrity";
import { PilotSection } from "./pilot-section";
import { FaqSection } from "./faq-section";
import { LandingFooter } from "./landing-footer";
import { PilotDialog } from "./pilot-dialog";

export function LandingPage() {
  const common = useTranslations("common");
  const [pilotDialogOpen, setPilotDialogOpen] = useState(false);

  return (
    <div className="landing-layout">
      <a href="#main-content" className="skip-link">{common("skipToContent")}</a>
      <LandingHeader onRequestPilot={() => setPilotDialogOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        <HeroSection onRequestPilot={() => setPilotDialogOpen(true)} />
        <RealityComparison />
        <ProductShowcase />
        <ArchitectureIntegrity />
        <FaqSection />
        <PilotSection onRequestPilot={() => setPilotDialogOpen(true)} />
      </main>
      <LandingFooter />
      <PilotDialog isOpen={pilotDialogOpen} onClose={() => setPilotDialogOpen(false)} />
    </div>
  );
}
