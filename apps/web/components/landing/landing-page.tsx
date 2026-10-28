"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { RealityComparison } from "./reality-comparison";
import { ProductShowcase } from "./product-showcase";
import { DemoProgressChart } from "./demo-progress-chart";
import { ArchitectureIntegrity } from "./architecture-integrity";
import { PilotSection } from "./pilot-section";
import { FaqSection } from "./faq-section";
import { LandingFooter } from "./landing-footer";
import { PilotDialog } from "./pilot-dialog";
import { ScrollcraftRuntime } from "./scrollcraft-runtime";

export function LandingPage() {
  const common = useTranslations("common");
  const t = useTranslations("landing.blueprint");
  const [pilotDialogOpen, setPilotDialogOpen] = useState(false);

  return (
    <div className="landing-layout blueprint-layout">
      <a href="#main-content" className="skip-link">{common("skipToContent")}</a>
      <ScrollcraftRuntime />
      <LandingHeader />
      <div className="blueprint-measure" aria-hidden="true"><span /></div>
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <RealityComparison />
        <ProductShowcase />
        <section id="curve" className="blueprint-curve landing-section" aria-labelledby="curve-heading">
          <div className="landing-container blueprint-curve__layout">
            <div className="blueprint-curve__intro"><h2 id="curve-heading">{t("curveTitle")}</h2><p>{t("curveLead")}</p><p className="blueprint-curve__source">{t("curveDisclosure")}</p></div>
            <div className="blueprint-curve__figure"><div className="blueprint-curve__figure-head"><span>{t("curveLabel")}</span><span>{t("curvePeriod")}</span></div><div className="blueprint-curve__metric"><span>{t("curveDifference")}</span><strong>{t("differenceValue")}</strong></div><DemoProgressChart /></div>
          </div>
        </section>
        <ArchitectureIntegrity />
        <FaqSection />
        <PilotSection onRequestPilot={() => setPilotDialogOpen(true)} />
      </main>
      <LandingFooter />
      <PilotDialog isOpen={pilotDialogOpen} onClose={() => setPilotDialogOpen(false)} />
    </div>
  );
}
