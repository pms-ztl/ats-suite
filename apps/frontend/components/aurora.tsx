// ============================================================
// CDC ATS "Aurora" component recipes for Next.js + shadcn/ui.
// Extend shadcn primitives with the Aurora variants used across the product.
// Requires the Aurora tokens in app/globals.css + tailwind.config.ts.
// ============================================================
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

/* ---------- Button: primary | ai | soft | ghost | danger | outlineAi ---------- */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold " +
  "transition-[transform,background,box-shadow] duration-fast ease-out " +
  "focus-visible:outline-none focus-visible:shadow-ring active:scale-[.985] " +
  "disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-brand text-brand-on shadow-e1 hover:shadow-e2 hover:-translate-y-px",
        ai:        "bg-ai text-ai-on shadow-e1 hover:shadow-e2 hover:-translate-y-px", // machine actions only
        soft:      "bg-surface-2 text-ink border border-line-2 hover:border-line-strong",
        ghost:     "bg-transparent text-ink-2 hover:bg-surface-2",
        danger:    "bg-danger-tint text-danger hover:bg-danger hover:text-brand-on",
        outlineAi: "bg-ai-tint text-ai-ink hover:bg-ai hover:text-ai-on",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-base", lg: "h-11 px-[18px] text-md", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

/* ---------- StatusBadge: icon + word, never color alone (a11y 1.4.1) ---------- */
type Status = "pass" | "review" | "fail" | "open" | "draft";
const STATUS: Record<Status, { label: string; cls: string }> = {
  pass:   { label: "Pass",     cls: "text-ok bg-ok-tint" },
  review: { label: "Review",   cls: "text-warn bg-warn-tint" },
  fail:   { label: "No match", cls: "text-danger bg-danger-tint" },
  open:   { label: "Open",     cls: "text-brand bg-brand-tint" },
  draft:  { label: "Draft",    cls: "text-ink-3 bg-surface-3" },
};
export function StatusBadge({ status, icon }: { status: Status; icon: React.ReactNode }) {
  const s = STATUS[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold", s.cls)}>
      {icon}
      {s.label}
    </span>
  );
}

/* ---------- AIChip: marks anything machine-generated (violet, advisory) ---------- */
export function AIChip({ children = "AI · advisory", solid = false }: { children?: React.ReactNode; solid?: boolean }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold whitespace-nowrap",
      solid ? "bg-ai text-ai-on" : "bg-ai-tint text-ai-ink"
    )}>
      <SparkleIcon className="h-3 w-3" />
      {children}
    </span>
  );
}

/* ---------- Card (Aurora materials) ---------- */
export function Card({ material = "flat", className, ...props }:
  React.HTMLAttributes<HTMLDivElement> & { material?: "flat" | "glass" | "clay" }) {
  const base = { flat: "flat", glass: "glass", clay: "clay" }[material];
  return <div className={clsx(base, "rounded-xl", className)} {...props} />;
}

/* ---------- Skeleton (holds layout, zero CLS) ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} aria-hidden="true" />;
}

/* ---------- ConfidenceMeter: shown separately from score, 0.70 threshold ---------- */
export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const low = value < 0.7;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ai-ink">
          <SparkleIcon className="h-3 w-3" /> Model confidence
        </span>
        <span className={clsx("font-mono text-xs font-semibold", low ? "text-warn" : "text-ai-ink")}>{pct}%</span>
      </div>
      <div className="relative h-[7px] overflow-hidden rounded-pill bg-surface-3">
        <div className="absolute inset-y-0 z-10 w-px bg-line-strong" style={{ left: "70%" }} />
        <div className={clsx("h-full rounded-pill", low ? "bg-warn" : "bg-ai")} style={{ width: `${pct}%` }} />
      </div>
      <p className={clsx("text-[11px]", low ? "text-warn" : "text-ink-3")}>
        {low ? "Below threshold, human verification recommended" : "Within auto-advance threshold"}
      </p>
    </div>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({ illustration, title, body, actions }: {
  illustration?: React.ReactNode; title: string; body: string; actions?: React.ReactNode;
}) {
  return (
    <div className="m-auto max-w-[300px] text-center">
      {illustration && <div className="mx-auto mb-[18px] animate-[floaty_5s_ease-out_infinite_alternate]">{illustration}</div>}
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-[7px] text-sm leading-relaxed text-ink-2">{body}</p>
      {actions && <div className="mt-[18px] flex flex-wrap justify-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ---------- ErrorState ---------- */
export function ErrorState({ title, body, code, onRetry }: {
  title: string; body: string; code?: string; onRetry?: () => void;
}) {
  return (
    <div className="m-auto max-w-[320px] text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-danger-tint text-danger">
        <AlertIcon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-[7px] text-sm leading-relaxed text-ink-2">{body}</p>
      {code && <code className="mt-3 inline-block rounded-sm border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-3">{code}</code>}
      <div className="mt-4 flex justify-center gap-2.5">
        <Button size="sm" onClick={onRetry}><RetryIcon className="h-3.5 w-3.5" /> Try again</Button>
        <Button size="sm" variant="ghost">Contact support</Button>
      </div>
    </div>
  );
}

/* ---------- tiny inline icons (swap for lucide-react where preferred) ---------- */
const SparkleIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />
  </svg>
);
const AlertIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.3h16.2a1.5 1.5 0 0 0 1.3-2.3L13.7 4.3a1.5 1.5 0 0 0-2.6 0z" />
  </svg>
);
const RetryIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" />
  </svg>
);
