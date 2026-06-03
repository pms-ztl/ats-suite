"use client";
// components/aurora-ui.tsx
// Shared primitives that the screens need but that are not in aurora-kit:
// Btn and StatusBadge, ported verbatim from foundations.jsx. Ships with batch C1.
import * as React from "react";
import { Icon, type IconName } from "./icon";

export function Btn({
  variant = "soft", size = "md", icon, trailIcon, children, onClick, style = {}, type,
}: {
  variant?: "primary" | "ai" | "soft" | "ghost" | "danger" | "outlineAi";
  size?: "sm" | "md" | "lg";
  icon?: IconName; trailIcon?: IconName; children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void; style?: React.CSSProperties; type?: "button" | "submit";
}) {
  const pad = size === "sm" ? "6px 11px" : size === "lg" ? "11px 18px" : "8px 14px";
  const fs = size === "sm" ? "var(--fs-sm)" : "var(--fs-base)";
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: pad, fontSize: fs,
    fontFamily: "var(--font-sans)", fontWeight: 600, borderRadius: "var(--r)", cursor: "pointer",
    border: "1px solid transparent", whiteSpace: "nowrap", lineHeight: 1,
    transition: "transform var(--t-fast) var(--ease-out), background var(--t) var(--ease-out), box-shadow var(--t) var(--ease-out), border-color var(--t)",
  };
  const V: Record<string, React.CSSProperties> = {
    primary: { background: "var(--brand)", color: "var(--on-brand)", boxShadow: "var(--e1)" },
    ai: { background: "var(--ai)", color: "var(--on-ai)", boxShadow: "var(--e1)" },
    soft: { background: "var(--surface-2)", color: "var(--ink)", borderColor: "var(--line-2)" },
    ghost: { background: "transparent", color: "var(--ink-2)" },
    danger: { background: "var(--danger-tint)", color: "var(--danger)", borderColor: "transparent" },
    outlineAi: { background: "var(--ai-tint)", color: "var(--ai-ink)", borderColor: "transparent" },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...V[variant], ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />}
      {children}
      {trailIcon && <Icon name={trailIcon} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

// Status badge, ALWAYS icon + word, never color alone.
export type StatusKind = "pass" | "review" | "fail" | "open" | "draft";
export function StatusBadge({ kind }: { kind: StatusKind }) {
  const M: Record<StatusKind, { t: string; icon: IconName; tone: string; bg: string }> = {
    pass: { t: "Pass", icon: "check", tone: "var(--ok)", bg: "var(--ok-tint)" },
    review: { t: "Review", icon: "eye", tone: "var(--warn)", bg: "var(--warn-tint)" },
    fail: { t: "No match", icon: "x", tone: "var(--danger)", bg: "var(--danger-tint)" },
    open: { t: "Open", icon: "dot", tone: "var(--brand)", bg: "var(--brand-tint)" },
    draft: { t: "Draft", icon: "dot", tone: "var(--ink-3)", bg: "var(--surface-3)" },
  };
  const m = M[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
      <Icon name={m.icon} size={13} stroke={2.2} />{m.t}
    </span>
  );
}

// Small shared empty-state hint used by screens when an array prop is [].
export function EmptyHint({ icon = "inbox", text }: { icon?: IconName; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 16px", textAlign: "center", color: "var(--ink-3)" }}>
      <span style={{ width: 38, height: 38, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--ink-3)" }}><Icon name={icon} size={19} /></span>
      <span style={{ fontSize: "var(--fs-sm)" }}>{text}</span>
    </div>
  );
}
