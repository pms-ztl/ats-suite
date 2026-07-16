"use client";
// app/(dashboard)/settings/layout.tsx, two-panel settings shell.
// Left rail navigates; right panel renders the active settings route.
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { group: string; items: [string, string][] }[] = [
  { group: "Workspace", items: [["/settings", "General"], ["/settings/team", "Team & roles"], ["/settings/branding", "Branding"], ["/settings/features", "Feature flags"]] },
  { group: "Security", items: [["/settings/security", "Security & 2FA"], ["/settings/sso", "SSO / SAML"], ["/settings/api-keys", "API keys"], ["/settings/retention", "Data retention"]] },
  { group: "Connections", items: [["/settings/integrations", "Integrations"], ["/settings/email-templates", "Email templates"], ["/settings/cloud-sync", "Cloud sync"], ["/settings/inbound-email", "Inbound email"], ["/settings/sms", "SMS"], ["/settings/chrome-extension", "Chrome extension"]] },
  { group: "Plan", items: [["/settings/billing", "Billing & plan"]] },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[230px_1fr]">
      <nav aria-label="Settings" className="md:sticky md:top-6 md:self-start">
        <h1 className="mb-3 text-lg font-extrabold tracking-tight">Settings</h1>
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="mb-1 px-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>{g.group}</div>
            {g.items.map(([href, label]) => {
              const active = path === href;
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  data-active={active || undefined}
                  className="settings-nav-link block rounded px-3 py-2 text-sm font-medium"
                  // Inline style + CSS vars, matching the idiom used across the rest
                  // of the app. The previous Tailwind colour utilities (bg-brand-tint /
                  // text-brand-ink) were emitted correctly but live in @layer utilities,
                  // which loses the cascade to this app's unlayered globals.css — so the
                  // active item rendered with a transparent background and inherited
                  // text colour, i.e. no visible highlight at all.
                  style={{
                    background: active ? "var(--brand-tint)" : "transparent",
                    color: active ? "var(--brand-ink)" : "var(--ink-2)",
                    boxShadow: active ? "inset 2px 0 0 var(--brand)" : undefined,
                  }}>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
        {/* Hover affordance for the non-active items (inline styles can't express :hover). */}
        <style jsx global>{`
          .settings-nav-link:not([data-active]):hover { background: var(--surface-2) !important; }
        `}</style>
      </nav>
      <section>{children}</section>
    </div>
  );
}
