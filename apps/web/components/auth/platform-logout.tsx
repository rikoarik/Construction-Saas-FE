"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/api/session";
import { NoticeToast, useNoticeToast } from "@/components/ui/notice-toast";
import { Button } from "@/components/ui/primitives";

export function PlatformLogout() {
  const t = useTranslations("platform");
  const auth = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { message, dismiss, notify } = useNoticeToast();
  async function signOut() {
    setPending(true);
    dismiss();
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      notify(t("signOutError"));
      setPending(false);
    }
  }
  return <div style={{ marginTop: "2rem" }}>
    <Button variant="primary" onClick={signOut} busy={pending}>{t("signOut")}</Button>
    <NoticeToast message={message} onDismiss={dismiss} dismissLabel={auth("dismissNotice")} />
  </div>;
}
