"use client";

import { useState } from "react";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { RealityComparison } from "./reality-comparison";
import { InteractiveLedger } from "./interactive-ledger";
import { CapabilityPillars } from "./capability-pillars";
import { ArchitectureIntegrity } from "./architecture-integrity";
import { PilotSection } from "./pilot-section";
import { FaqSection } from "./faq-section";
import { LandingFooter } from "./landing-footer";
import { PilotDialog } from "./pilot-dialog";

export function LandingPage() {
  const [pilotDialogOpen, setPilotDialogOpen] = useState(false);

  const handleOpenPilot = () => {
    setPilotDialogOpen(true);
  };

  const handleClosePilot = () => {
    setPilotDialogOpen(false);
  };

  return (
    <div className="landing-layout">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <LandingHeader onRequestPilot={handleOpenPilot} />

      <main id="main-content" tabIndex={-1}>
        <HeroSection onRequestPilot={handleOpenPilot} />
        <RealityComparison />
        <InteractiveLedger />
        <CapabilityPillars />
        <ArchitectureIntegrity />
        <PilotSection onRequestPilot={handleOpenPilot} />
        <FaqSection />
      </main>

      <LandingFooter />

      <PilotDialog isOpen={pilotDialogOpen} onClose={handleClosePilot} />
    </div>
  );
}