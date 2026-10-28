"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleControl() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const options = [{ value: "en", short: "EN", label: t("english") }, { value: "id", short: "ID", label: t("indonesian") }];
  const current = options.find((option) => option.value === locale) ?? options[0];

  useEffect(() => {
    if (!open) return;
    optionRefs.current[locale === "id" ? 1 : 0]?.focus();
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open, locale]);

  const selectLocale = (value: string) => {
    setOpen(false);
    if (value !== locale) router.replace(pathname, { locale: value });
  };

  const navigateOptions = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = optionRefs.current.findIndex((option) => option === document.activeElement);
    let nextIndex: number | undefined;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="locale-control" ref={rootRef}>
      <button ref={buttonRef} type="button" className="locale-control__trigger" aria-label={t("language")} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}>
        <Languages size={15} aria-hidden="true" /><span>{current.short}</span><ChevronDown size={13} aria-hidden="true" className={open ? "is-open" : ""} />
      </button>
      <AnimatePresence>
        {open && <motion.div className="locale-control__menu" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }}>
          <span className="locale-control__label">{t("language")}</span>
          <div role="listbox" aria-label={t("language")} tabIndex={-1} onKeyDown={navigateOptions}>
            {options.map((option, index) => <button key={option.value} ref={(element) => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={locale === option.value} className="locale-control__option" onClick={() => selectLocale(option.value)}>
              <span className="locale-control__code">{option.short}</span><span>{option.label}</span>{locale === option.value && <Check size={14} aria-hidden="true" />}
            </button>)}
          </div>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
