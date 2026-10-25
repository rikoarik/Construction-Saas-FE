"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TableHTMLAttributes } from "react";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  busy?: boolean;
}

export function Button({
  variant = "secondary",
  busy = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = ["ui-button", `ui-button--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      {...props}
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {children}
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
