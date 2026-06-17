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
            <div className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-ink-3">{g.group}</div>
            {g.items.map(([href, label]) => (
              <Link key={href} href={href}
                aria-current={path === href ? "page" : undefined}
                className={"block rounded px-3 py-2 text-sm font-medium " + (path === href ? "bg-brand-tint text-brand-ink" : "text-ink-2 hover:bg-surface-2")}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <section>{children}</section>
    </div>
  );
}
