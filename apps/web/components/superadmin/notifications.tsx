"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Building2, Check, CreditCard, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import {
  notificationReads,
  notificationTypes,
  platformPost,
  type NotificationItem,
  type NotificationReadFilter,
  type NotificationTypeFilter,
} from "@/lib/api/platform-dashboard";
import { dateTime, number, relativeTime } from "./format";
import { usePlatformLocale } from "./locale";
import { useNotifications, useRefreshNotifications } from "./use-dashboard";
import { WidgetState } from "./widgets";

/** Machine type → locale key. The API never ships prose, so the label is resolved here. */
const titleKeys = {
  process_failed: "notificationProcessFailed",
  process_retry: "notificationProcessRetry",
  company_suspended: "notificationCompanySuspended",
  subscription_past_due: "notificationSubscriptionPastDue",
} as const;

const typeIcons: Record<NotificationItem["type"], LucideIcon> = {
  process_failed: Workflow,
  process_retry: Workflow,
  company_suspended: Building2,
  subscription_past_due: CreditCard,
};

const typeFilterKeys = {
  "": "notificationsAll",
  process: "notificationsProcess",
  company: "notificationsCompany",
  subscription: "notificationsSubscription",
} as const;

const readFilterKeys = {
  "": "notificationsReadAll",
  unread: "notificationsUnreadOnly",
  read: "notificationsReadOnly",
} as const;

function NotificationRow({ item, now, onToggle, pending }: { item: NotificationItem; now: number; onToggle: (item: NotificationItem) => void; pending: boolean }) {
  const { t, locale } = usePlatformLocale();
  const Icon = typeIcons[item.type];
  const title = t(titleKeys[item.type]);
  return <li className={`sa-bell__row${item.read ? " is-read" : ""}`}>
    <span className={`sa-bell__mark sa-bell__mark--${item.severity}`} aria-hidden="true"><Icon size={15} /></span>
    <div className="sa-bell__body">
      <p className="sa-bell__title">
        {title}
        {item.plan && <span className="sa-bell__tag">{item.plan}</span>}
      </p>
      <p className="sa-bell__meta">
        <span>{item.company_name ?? t("noCompany")}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={item.occurred_at} title={dateTime(item.occurred_at, locale)}>{relativeTime(item.occurred_at, now, locale)}</time>
      </p>
    </div>
    <button
      type="button"
      className="sa-bell__toggle"
      aria-pressed={item.read}
      aria-label={`${item.read ? t("notificationsMarkUnread") : t("notificationsMarkRead")} — ${title}`}
      disabled={pending}
      onClick={() => onToggle(item)}
    >
      <Check size={14} aria-hidden="true" />
    </button>
  </li>;
}

export function NotificationBell() {
  const { t, locale } = usePlatformLocale();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<NotificationTypeFilter>("");
  const [read, setRead] = useState<NotificationReadFilter>("");
  const [pending, setPending] = useState(false);
  // Timestamps render as absolute dates until the first client tick, so the
  // server and client markup agree.
  const [now, setNow] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const query = useNotifications(type, read);
  const reducedMotion = useReducedMotion();
  const refresh = useRefreshNotifications();
  const { message, dismiss, notify } = useNoticeToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
    const dismissOnPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", dismissOnPointer);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointer);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const unread = query.data?.unread;
  const items = query.data?.items ?? [];

  /** Every notification query is refreshed after a write: the unread total is
   *  shared across filters, so patching one page would leave a stale badge. */
  async function commit(path: string, body?: unknown) {
    setPending(true);
    try {
      await platformPost(path, body);
      await refresh();
    } catch { notify(t("notificationsActionError")); }
    finally { setPending(false); }
  }

  const toggle = (item: NotificationItem) => {
    void commit(item.read ? "notifications/unread" : "notifications/read", { keys: [item.key] });
  };

  return <div className="sa-bell" ref={rootRef}>
    <button
      ref={triggerRef}
      type="button"
      className="sa-bell__trigger"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={unread != null && unread > 0 ? t("notificationsUnreadCount").replace("{count}", number(unread, locale)) : t("notificationsOpen")}
      onClick={() => setOpen((value) => !value)}
    >
      <Bell size={17} aria-hidden="true" />
      {unread != null && unread > 0 && <span className="sa-bell__badge" aria-hidden="true">{unread > 99 ? "99+" : number(unread, locale)}</span>}
    </button>
    <AnimatePresence>
      {open ? <motion.div
        ref={panelRef}
        className="sa-bell__panel"
        role="dialog"
        aria-label={t("notifications")}
        initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="sa-bell__header">
          <div>
            <p className="sa-bell__caption">{t("notifications")}</p>
            <p className="sa-bell__count">{unread == null ? (query.isPending ? t("loading") : t("dataUnavailable")) : unread > 0 ? t("notificationsUnreadCount").replace("{count}", number(unread, locale)) : t("notificationsAllRead")}</p>
          </div>
          <button type="button" className="sa-bell__action" disabled={pending || unread == null || unread === 0} onClick={() => { void commit("notifications/read-all"); }}>
            {t("notificationsMarkAll")}
          </button>
        </header>
        <div className="sa-bell__filters">
          <div className="sa-bell__chips" role="group" aria-label={t("notificationsFilterType")}>
            {notificationTypes.map((value) => <button key={value || "all"} type="button" className="sa-bell__chip" aria-pressed={type === value} onClick={() => setType(value)}>{t(typeFilterKeys[value])}</button>)}
          </div>
          <div className="sa-bell__chips" role="group" aria-label={t("notificationsFilterRead")}>
            {notificationReads.map((value) => <button key={value || "all"} type="button" className="sa-bell__chip" aria-pressed={read === value} onClick={() => setRead(value)}>{t(readFilterKeys[value])}</button>)}
          </div>
        </div>
        <div className="sa-bell__list">
          <WidgetState
            loading={query.isPending}
            error={query.error}
            empty={!items.length && { title: read === "read" ? t("notificationsNoRead") : t("notificationsEmpty"), icon: BellOff }}
            onRetry={() => { void query.refetch(); }}
            className="sa-bell__state"
          >
            <ul className="sa-bell__items">
              {items.map((item) => <NotificationRow key={item.key} item={item} now={now} pending={pending} onToggle={toggle} />)}
            </ul>
          </WidgetState>
        </div>
        {items.length >= 20 && <p className="sa-bell__foot">{t("notificationsLimit")}</p>}
      </motion.div> : null}
    </AnimatePresence>
    <NoticeToast message={message} onDismiss={dismiss} dismissLabel={t("dismiss")} />
  </div>;
}
