"use client";

import { ArrowDown, ArrowRight, Check, MapPin } from "lucide-react";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  onRequestPilot: () => void;
}

const actualPoints = "34,230 105,220 176,196 247,177 318,144 389,119 460,87";
const plannedPoints = "34,230 105,211 176,188 247,156 318,132 389,105 460,69";

export function HeroSection({ onRequestPilot }: HeroSectionProps) {
  const t = useTranslations("landing.hero");
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: .35, skipInitialAnimation: true });
  const productY = useTransform(progress, [0, 1], [0, 24]);
  const copyY = useTransform(progress, [0, 1], [0, 12]);
  const productScale = useTransform(progress, [0, 1], [1, .985]);

  return (
    <section ref={sectionRef} className="landing-hero" aria-labelledby="hero-heading">
      <div className="landing-hero__rule" aria-hidden="true" />
      <div className="landing-container landing-hero__layout">
        <motion.div
          className="landing-hero__copy"
          style={reduceMotion ? undefined : { y: copyY }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-dot" aria-hidden="true" />
            {t("badge")}
          </div>
          <h1 id="hero-heading" className="landing-hero__title">
            {t("title")}
          </h1>
          <p className="landing-hero__subtitle">{t("subtitle")}</p>
          <div className="landing-hero__actions">
            <button type="button" className="button button--primary landing-hero__cta-primary" onClick={onRequestPilot}>
              <span>{t("ctaSecondary")}</span>
              <span className="button__icon" aria-hidden="true"><ArrowRight size={16} /></span>
            </button>
            <a href="#product-ui" className="landing-hero__demo-link">
              <span>{t("ctaPrimary")}</span>
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="landing-hero__proof" aria-label={t("proofAria")}>
            <span><Check size={14} aria-hidden="true" />{t("proofOne")}</span>
            <span><Check size={14} aria-hidden="true" />{t("proofTwo")}</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-product"
          style={reduceMotion ? undefined : { y: productY, scale: productScale }}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-product__index" aria-hidden="true">01 / 04</div>
          <div className="hero-product__window">
            <div className="hero-product__systembar"><span>{t("footLabel")}</span><span><i aria-hidden="true" />{t("reportApproved")}</span></div>
            <header className="hero-product__header">
              <div>
                <span className="hero-product__overline">{t("previewLabel")}</span>
                <h2>{t("projectName")}</h2>
              </div>
              <span className="hero-product__demo">{t("demoLabel")}</span>
            </header>
            <div className="hero-product__location"><MapPin size={13} aria-hidden="true" />{t("projectLocation")}</div>
            <div className="hero-product__metrics">
              <div><span>{t("actualLabel")}</span><strong>{t("cumActualValue")}</strong></div>
              <div><span>{t("plannedLabel")}</span><strong>{t("plannedValue")}</strong></div>
              <div><span>{t("varianceLabel")}</span><strong className="text-warning">{t("cumActualVariance")}</strong></div>
            </div>
            <div className="hero-chart">
              <div className="hero-chart__heading">
                <span>{t("chartTitle")}</span>
                <span>{t("chartPeriod")}</span>
              </div>
              <svg viewBox="0 0 494 260" role="img" aria-label={t("chartAria")}>
                {[30, 80, 130, 180, 230].map((y) => <line key={y} x1="34" y1={y} x2="460" y2={y} className="hero-chart__grid" />)}
                <polyline points={plannedPoints} className="hero-chart__planned" />
                <polyline points={actualPoints} className="hero-chart__actual" />
                {[[34,230],[105,220],[176,196],[247,177],[318,144],[389,119],[460,87]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" className="hero-chart__point" />)}
                <text x="34" y="252" className="hero-chart__label">W1</text>
                <text x="460" y="252" textAnchor="end" className="hero-chart__label">W10</text>
              </svg>
              <div className="hero-chart__legend">
                <span><i className="legend-line legend-line--planned" aria-hidden="true" />{t("legendPlanned")}</span>
                <span><i className="legend-line legend-line--actual" aria-hidden="true" />{t("legendActual")}</span>
              </div>
            </div>
            <div className="hero-product__report">
              <div className="hero-product__report-icon"><Check size={17} aria-hidden="true" /></div>
              <div><strong>{t("batchItem")}</strong><span>{t("batchVerified")} · {t("batchVolumeValue")}</span></div>
              <span className="hero-product__report-status">{t("reportApproved")}</span>
            </div>
          </div>
          <div className="hero-product__caption"><span>{t("previewCaption")}</span><span aria-hidden="true">↘</span></div>
        </motion.div>
      </div>
      <div className="landing-container landing-hero__foot">
        <span>{t("footLabel")}</span>
        <div className="landing-hero__capabilities">
          <span>{t("capabilityOne")}</span><span>{t("capabilityTwo")}</span><span>{t("capabilityThree")}</span>
        </div>
      </div>
    </section>
  );
}
