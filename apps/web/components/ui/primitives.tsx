"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TableHTMLAttributes } from "react";
import { Check, ChevronDown, Info, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  busy?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = "secondary",
  busy = false,
  disabled = false,
  className = "",
  children,
  ref,
  ...props
}: ButtonProps) {
  const classes = ["button", `button--${variant}`, "ui-button", className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      ref={ref}
      {...props}
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy && <span className="ui-button__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, id, required, className = "", ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={fieldId}>
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={["ui-field__control", className].filter(Boolean).join(" ")}
      />
      {hint ? <p className="ui-field__hint" id={hintId}>{hint}</p> : null}
      {error ? <p className="ui-field__error" id={errorId}>{error}</p> : null}
    </div>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({ label, hint, error, id, required, className = "", children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = [props["aria-describedby"], hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return <div className="ui-field">
    <label className="ui-field__label" htmlFor={fieldId}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label>
    <select {...props} id={fieldId} required={required} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedBy} className={["ui-field__control", className].filter(Boolean).join(" ")}>{children}</select>
    {hint && <p className="ui-field__hint" id={`${fieldId}-hint`}>{hint}</p>}
    {error && <p className="ui-field__error" id={`${fieldId}-error`}>{error}</p>}
  </div>;
}

export type DateFieldProps = Omit<TextFieldProps, "type"> & { min?: string; max?: string };

export function DateField(props: DateFieldProps) {
  return <TextField {...props} type="date" />;
}

export interface DropdownOption {
  value: string;
  label: string;
  /** Secondary text, e.g. the resolved date span of a range preset. */
  hint?: string;
}

export interface DropdownProps {
  /** Accessible name for the trigger and the listbox. */
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Leading glyph, e.g. a calendar icon. */
  icon?: ReactNode;
  align?: "start" | "end";
  className?: string;
  /** Context line at the top of the menu, e.g. the resolved period of the selection. */
  menuCaption?: string;
}

/**
 * Custom select. Native `<select>` cannot carry the secondary hint per row or
 * match the platform pill styling, so this keeps listbox semantics by hand:
 * roving focus, Arrow/Home/End, Escape to close, outside pointer to dismiss.
 */
export function Dropdown({ label, value, options, onChange, icon, align = "start", className = "", menuCaption }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const index = Math.max(0, options.findIndex((option) => option.value === value));
    optionRefs.current[index]?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, options, value]);

  const move = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = optionRefs.current.findIndex((option) => option === document.activeElement);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (currentIndex + 1) % options.length;
    if (event.key === "ArrowUp") next = (currentIndex - 1 + options.length) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    optionRefs.current[next]?.focus();
  };

  const choose = (next: string) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (next !== value) onChange(next);
  };

  return <div className={`ui-dropdown ui-dropdown--${align} ${className}`.trim()} ref={rootRef}>
    <button
      ref={triggerRef}
      type="button"
      className="ui-dropdown__trigger"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listId : undefined}
      aria-label={`${label}: ${selected?.label ?? ""}`}
      onClick={() => setOpen(!open)}
      onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } }}
    >
      {icon ? <span className="ui-dropdown__icon" aria-hidden="true">{icon}</span> : null}
      <span className="ui-dropdown__value">{selected?.label}</span>
      <ChevronDown size={14} aria-hidden="true" className={`ui-dropdown__chevron ${open ? "is-open" : ""}`.trim()} />
    </button>
    <AnimatePresence>
      {open ? <motion.div
        className="ui-dropdown__menu"
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {menuCaption ? <p className="ui-dropdown__caption">{menuCaption}</p> : null}
        <div role="listbox" id={listId} aria-label={label} tabIndex={-1} onKeyDown={move}>
          {options.map((option, index) => <button
            key={option.value}
            ref={(element) => { optionRefs.current[index] = element; }}
            type="button"
            role="option"
            aria-selected={option.value === value}
            className="ui-dropdown__option"
            onClick={() => choose(option.value)}
          >
            <span className="ui-dropdown__option-label">{option.label}</span>
            {option.hint ? <span className="ui-dropdown__option-hint">{option.hint}</span> : null}
            <Check size={14} aria-hidden="true" className="ui-dropdown__check" />
          </button>)}
        </div>
      </motion.div> : null}
    </AnimatePresence>
  </div>;
}

export interface HintProps {
  /** Accessible name of the trigger, e.g. "About search scope". */
  label: string;
  /** Explanation shown on hover and keyboard focus. */
  text: string;
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Disclosure for secondary explanation. Long caveats belong here instead of a
 * visible paragraph, so the surface stays scannable while the detail is still
 * reachable by pointer and keyboard.
 */
export function Hint({ label, text, side = "bottom", className = "" }: HintProps) {
  const id = useId();
  return (
    <span className={`ui-hint ui-hint--${side} ${className}`.trim()}>
      <button type="button" className="ui-hint__trigger" aria-label={label} aria-describedby={id}>
        <Info size={14} aria-hidden="true" />
      </button>
      <span role="tooltip" id={id} className="ui-hint__bubble">{text}</span>
    </span>
  );
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, closeLabel, description, children, className = "" }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={["ui-dialog", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
    >
      <header className="ui-dialog__header">
        <div>
          <h2 className="ui-dialog__title" id={titleId}>{title}</h2>
          {description ? <p className="ui-dialog__description" id={descriptionId}>{description}</p> : null}
        </div>
        <Button type="button" className="ui-dialog__close" onClick={() => onOpenChange(false)} aria-label={closeLabel}>
          <X size={18} aria-hidden="true" />
        </Button>
      </header>
      <div className="ui-dialog__content">{children}</div>
    </dialog>
  );
}

export interface TableRegionProps extends TableHTMLAttributes<HTMLTableElement> {
  label: string;
  caption: ReactNode;
  children: ReactNode;
}

export function TableRegion({ label, caption, children, className = "", ...props }: TableRegionProps) {
  return (
    <div className="ui-table-region" role="region" aria-label={label} tabIndex={0}>
      <table {...props} className={["ui-table", className].filter(Boolean).join(" ")}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
