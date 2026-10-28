"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type NoticeTone = "error" | "warning" | "success" | "info";
export type NoticeMessage = { id: number; text: string; tone: NoticeTone };

export function useNoticeToast() {
  const [message, setMessage] = useState<NoticeMessage | null>(null);
  const nextId = useRef(0);
  const dismiss = useCallback(() => setMessage(null), []);
  const notify = (text: string, tone: NoticeTone = "error") => setMessage({ id: ++nextId.current, text, tone });
  return { message, dismiss, notify };
}

/** Reusable notification with timed exit; reduced motion is handled in CSS. */
export function NoticeToast({ message, onDismiss, dismissLabel }: { message: NoticeMessage | null; onDismiss: () => void; dismissLabel: string }) {
  if (!message) return null;
  return <ToastItem key={message.id} message={message} onDismiss={onDismiss} dismissLabel={dismissLabel} />;
}

function ToastItem({ message, onDismiss, dismissLabel }: { message: NoticeMessage; onDismiss: () => void; dismissLabel: string }) {
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const isError = message?.tone === "error" || message?.tone === "warning";
  const duration = isError ? 8000 : 5000;

  useEffect(() => {
    if (!message || paused) return;
    const timer = window.setTimeout(() => setExiting(true), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, paused]);

  useEffect(() => {
    if (!message || !exiting) return;
    const timer = window.setTimeout(onDismiss, 200);
    return () => window.clearTimeout(timer);
  }, [message, exiting, onDismiss]);

  const Icon = message.tone === "error" ? AlertCircle : message.tone === "warning" ? AlertTriangle : message.tone === "success" ? CheckCircle2 : Info;
  return (
    <div
      className={`notice-toast notice-toast--${message.tone}${exiting ? " notice-toast--exiting" : ""}`}
      role={isError ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <Icon size={20} aria-hidden="true" />
      <p>{message.text}</p>
      <button type="button" className="notice-toast__dismiss" onClick={onDismiss} aria-label={dismissLabel}><X size={18} aria-hidden="true" /></button>
    </div>
  );
}
