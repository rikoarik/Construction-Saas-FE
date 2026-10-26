"use client";

import { useRef, useState } from "react";
import { ArrowDownToLine, Building2, CalendarRange, Check, ChevronDown, CircleCheck, ClipboardCheck, FileText, FolderKanban, LayoutDashboard, Plus, Search, UsersRound } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const screens = ["overview", "budget", "reports"] as const;
type Screen = (typeof screens)[number];

export function ProductShowcase() {
  const t = useTranslations("landing.showcase");
  const [screen, setScreen] = useState<Screen>("overview");
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: .4, skipInitialAnimation: true });
  const frameY = useTransform(progress, [0, 1], [18, -10]);
  const fieldY = useTransform(progress, [0, 1], [16, -16]);
  const approvalY = useTransform(progress, [0, 1], [-12, 18]);

  useGSAP(() => {
    if (reduceMotion || !stageRef.current) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 861px)", () => {
      gsap.fromTo(stageRef.current, { scale: .985 }, { scale: 1, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "center 55%", scrub: .7 } });
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [reduceMotion], revertOnUpdate: true });

  return (
    <section ref={sectionRef} id="product-ui" className="product-showcase" aria-labelledby="product-showcase-heading">
      <div className="product-showcase__gridline" aria-hidden="true" />
      <div className="landing-container">
        <div className="section-intro section-intro--split">
          <div><div className="eyebrow">{t("eyebrow")}</div><h2 id="product-showcase-heading" className="section-title">{t("title")}</h2></div>
          <p className="section-description">{t("description")}</p>
        </div>
        <div className="product-showcase__tabs" aria-label={t("tabsAria")}>
          {screens.map((item, index) => <button key={item} type="button" aria-pressed={screen === item} onClick={() => setScreen(item)}><span>0{index + 1}</span>{t(`${item}Tab`)}</button>)}
        </div>
        <div ref={stageRef} className="product-showcase__stage">
          <motion.div className="product-showcase__frame" style={reduceMotion ? undefined : { y: frameY }}>
            <div className="product-window">
              <header className="product-window__topbar">
                <div className="product-window__company"><span className="product-window__logo"><Building2 size={15} aria-hidden="true" /></span><span>{t("company")}</span><ChevronDown size={13} aria-hidden="true" /></div>
                <div className="product-window__search"><Search size={14} aria-hidden="true" /><span>{t("search")}</span><kbd>⌘ K</kbd></div>
                <div className="product-window__avatar"><UsersRound size={13} aria-hidden="true" /></div>
              </header>
              <div className="product-window__body">
                <aside className="product-sidebar" aria-label={t("sidebarAria")}>
                  <span className="product-sidebar__label">{t("workspace")}</span>
                  <div className="product-sidebar__project"><span><Building2 size={13} aria-hidden="true" /></span><div><strong>{t("project")}</strong><small>{t("projectMeta")}</small></div></div>
                  <nav>{[
                    { icon: LayoutDashboard, label: t("overviewTab"), id: "overview" }, { icon: FolderKanban, label: t("budgetTab"), id: "budget" },
                    { icon: CalendarRange, label: t("schedule") }, { icon: ClipboardCheck, label: t("reportsTab"), id: "reports" }, { icon: FileText, label: t("documents") }, { icon: UsersRound, label: t("team") },
                  ].map((item, index) => <button key={`${item.id ?? "destination"}-${index}`} type="button" className={screen === item.id ? "is-active" : ""} onClick={() => { if (screens.includes(item.id as Screen)) setScreen(item.id as Screen); }}><item.icon size={15} aria-hidden="true" /><span>{item.label}</span></button>)}</nav>
                  <div className="product-sidebar__bottom"><span className="product-sidebar__status"><i aria-hidden="true" />{t("synced")}</span><span>v2.4.0</span></div>
                </aside>
                <div className="product-window__content">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={screen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .24, ease: [0.22, 1, 0.36, 1] }}>
                      {screen === "overview" && <OverviewScreen />}
                      {screen === "budget" && <BudgetScreen />}
                      {screen === "reports" && <ReportsScreen />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div className="product-float product-float--field" style={reduceMotion ? undefined : { y: fieldY }}>
            <div className="product-float__icon"><CircleCheck size={18} aria-hidden="true" /></div><div><span>{t("fieldUpdate")}</span><strong>{t("fieldValue")}</strong><small>{t("fieldMeta")}</small></div>
          </motion.div>
          <motion.div className="product-float product-float--approval" style={reduceMotion ? undefined : { y: approvalY }}>
            <span>{t("approvalQueue")}</span><strong>04</strong><div><i /><i /><i /><small>{t("reviewNeeded")}</small></div>
          </motion.div>
        </div>
        <p className="product-showcase__note">{t("demoNote")}</p>
      </div>
    </section>
  );
}

function ScreenHeader({ titleKey, subtitleKey, actionKey }: { titleKey: string; subtitleKey: string; actionKey: string }) {
  const t = useTranslations("landing.showcase");
  return <div className="product-screen__header"><div><span>{t("project")}</span><h3>{t(titleKey)}</h3><p>{t(subtitleKey)}</p></div><button type="button"><Plus size={13} aria-hidden="true" />{t(actionKey)}</button></div>;
}

function OverviewScreen() {
  const t = useTranslations("landing.showcase");
  return <><ScreenHeader titleKey="overviewTitle" subtitleKey="overviewSubtitle" actionKey="newReport" />
    <div className="product-metrics">{[["plannedMetric", "39.50%"], ["actualMetric", "35.40%"], ["varianceMetric", "−4.10 pp"], ["pendingMetric", "04"]].map(([key, value]) => <div key={key}><span>{t(key)}</span><strong>{value}</strong><small>{t("currentPeriod")}</small></div>)}</div>
    <div className="product-overview-grid"><div className="product-panel product-panel--chart"><div className="product-panel__header"><strong>{t("progressChart")}</strong><span>{t("weekly")}</span></div><svg viewBox="0 0 520 190" role="img" aria-label={t("chartAria")}>{[25,65,105,145].map((y) => <line key={y} x1="22" y1={y} x2="500" y2={y} className="product-chart__grid" />)}<polyline points="22,158 100,140 178,112 256,91 334,63 412,48 490,27" className="product-chart__plan" /><polyline points="22,161 100,146 178,124 256,108 334,86 412,70 490,54" className="product-chart__actual" />{[[22,161],[100,146],[178,124],[256,108],[334,86],[412,70],[490,54]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="3.5" className="product-chart__point" />)}</svg><div className="product-chart__legend"><span>{t("plannedMetric")}</span><span>{t("actualMetric")}</span></div></div>
      <div className="product-panel product-panel--queue"><div className="product-panel__header"><strong>{t("reviewQueue")}</strong><span>04</span></div>{[1,2,3].map((item) => <div className="product-queue-row" key={item}><span className="product-queue-row__icon"><ClipboardCheck size={13} aria-hidden="true" /></span><div><strong>{t(`queue${item}`)}</strong><small>{t("awaitingReview")}</small></div></div>)}</div></div>
    <div className="product-panel product-panel--work"><div className="product-panel__header"><strong>{t("recentWork")}</strong><span>{t("viewAll")}</span></div>{[1,2,3].map((item) => <div className="product-work-row" key={item}><span>0{item}</span><strong>{t(`work${item}`)}</strong><small>{t(`work${item}Meta`)}</small><span className="product-approved"><Check size={11} aria-hidden="true" />{t("approved")}</span></div>)}</div>
  </>;
}

function BudgetScreen() {
  const t = useTranslations("landing.showcase");
  return <><ScreenHeader titleKey="budgetTitle" subtitleKey="budgetSubtitle" actionKey="importBudget" />
    <div className="product-budget-meta"><span>{t("approvedVersion")}</span><strong>{t("budgetTotal")}</strong></div>
    <div className="product-panel product-budget-table"><div className="product-budget-row product-budget-row--head"><span>{t("code")}</span><span>{t("workItem")}</span><span>{t("quantity")}</span><span>{t("weight")}</span></div>{[1,2,3,4,5,6].map((item) => <div className={`product-budget-row ${item === 1 || item === 4 ? "is-parent" : ""}`} key={item}><span>{item < 4 ? `01.0${item}` : `02.0${item - 3}`}</span><strong>{t(`budgetItem${item}`)}</strong><span>{t(`budgetQty${item}`)}</span><span>{[18.4,12.8,9.6,14.2,11.5,8.3][item - 1]}%</span></div>)}</div>
  </>;
}

function ReportsScreen() {
  const t = useTranslations("landing.showcase");
  return <><ScreenHeader titleKey="reportsTitle" subtitleKey="reportsSubtitle" actionKey="createDocument" />
    <div className="product-reports-layout"><div className="product-report-list">{[1,2,3].map((item) => <div className={item === 1 ? "is-active" : ""} key={item}><FileText size={15} aria-hidden="true" /><span><strong>{t(`document${item}`)}</strong><small>{t(`document${item}Meta`)}</small></span><CircleCheck size={14} aria-hidden="true" /></div>)}</div><div className="product-paper"><div className="product-paper__brand"><span>{t("company")}</span><FileText size={16} aria-hidden="true" /></div><h4>{t("paperTitle")}</h4><p>{t("paperPeriod")}</p><div className="product-paper__summary"><span>{t("plannedMetric")}<strong>39.50%</strong></span><span>{t("actualMetric")}<strong>35.40%</strong></span></div>{[72,48,86,62,78,42].map((width,index) => <i key={index} style={{ width: `${width}%` }} />)}<button type="button"><ArrowDownToLine size={12} aria-hidden="true" />{t("download")}</button></div></div>
  </>;
}
