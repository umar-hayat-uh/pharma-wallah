"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/*
 * Small controls shared by the Molecular Lab panels. Sheets render inside the
 * .pw-mlab element (fixed-positioned), so they inherit the lab's theme tokens:
 * a bottom sheet on phones, a side panel from 768px.
 */

export function Sheet({
  open,
  title,
  onClose,
  children,
  size,
  actions,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "wide";
  actions?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Callers pass inline handlers; keep the effect keyed on `open` alone so a
  // re-render does not steal focus back to the sheet.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    // Focus the sheet itself, not its first field: on phones focusing an input
    // would throw the keyboard up over the sheet.
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="ml-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="ml-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} data-size={size} tabIndex={-1}>
        <div className="ml-sheet-grip" aria-hidden="true" />
        <div className="ml-sheet-head">
          <h2 id={titleId}>{title}</h2>
          {actions}
          <button type="button" className="ml-btn ml-btn--ghost ml-btn--icon" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="ml-sheet-body">{children}</div>
      </div>
    </>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirm,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirm: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const cancel = useRef(onCancel);
  cancel.current = onCancel;
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cancel.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="ml-scrim" onClick={onCancel} aria-hidden="true" />
      <div className="ml-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {body && <p>{body}</p>}
        <div className="ml-dialog-actions">
          <button ref={cancelRef} type="button" className="ml-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ml-btn ml-btn--primary" onClick={onConfirm}>
            {confirm}
          </button>
        </div>
      </div>
    </>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  large,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  label: string;
  large?: boolean;
}) {
  return (
    <div className={`ml-seg${large ? " ml-seg--lg" : ""}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} disabled={o.disabled} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A tool button: icon + visible label, with the full description as tooltip and accessible name. */
export function ToolButton({
  icon,
  label,
  tip,
  pressed,
  onClick,
  disabled,
  kbd,
  wide,
}: {
  icon: ReactNode;
  label: string;
  tip: string;
  pressed?: boolean;
  onClick: () => void;
  disabled?: boolean;
  kbd?: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ml-tool${wide ? " ml-tool--wide" : ""}`}
      aria-pressed={pressed}
      title={kbd ? `${tip} (${kbd})` : tip}
      aria-label={tip}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
      {kbd && wide && <kbd className="ml-kbd">{kbd}</kbd>}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  pressed,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button type="button" className={`ml-btn ml-btn--icon ${className}`} onClick={onClick} disabled={disabled} aria-label={label} title={label} aria-pressed={pressed}>
      {icon}
    </button>
  );
}
