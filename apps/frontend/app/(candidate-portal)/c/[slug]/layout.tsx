"use client";
// app/(candidate-portal)/c/[slug]/layout.tsx
//
// WF6-F4 (3) — mounts the real, tenant-branded BrandedShell as the chrome for
// the per-tenant public career portal subtree (/c/{slug}/*), so the public
// board white-labels with the tenant's logo, brand color, tagline, website, and
// optional hero. BrandedShell already exists and fetches GET /api/public/branding/
// {slug}; it was orphaned (built but never mounted). This layout wires it in.
//
// Two route shapes live under /c/{slug}:
//   - /c/{slug}/jobs              the FULL-BLEED job board (the exact Claude
//                                 Design "portalx" port). It ships its OWN
//                                 complete chrome (nav + two footers + bg video),
//                                 so it MUST render bare — wrapping it in
//                                 BrandedShell would double the chrome. The
//                                 parent CandidateLayout already renders this
//                                 route bare; we keep that here too.
//   - /c/{slug}/jobs/{id}/apply   the content-only apply form. This is what
//                                 BrandedShell is for: it supplies the branded
//                                 nav + footer (hero off, the form is the focus).
//
// GRACEFUL: BrandedShell falls back to a neutral platform look when branding
// 404s / fails, and the apply page itself keeps its own honest loading/error
// states. The board route is byte-identical to before (rendered bare).
import { usePathname, useParams } from "next/navigation";
import { BrandedShell } from "@/components/careers/branded-shell";

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  // The job board ships its own full chrome — render it bare so BrandedShell does
  // not double-wrap it (matches CandidateLayout's full-bleed handling).
  const isFullBleedBoard = /^\/c\/[^/]+\/jobs$/.test(pathname ?? "");
  if (isFullBleedBoard || !slug) return <>{children}</>;

  // Content-only routes (e.g. the apply form) get the branded shell. Hero off:
  // the apply page leads with the role header, not a generic careers hero.
  return (
    <BrandedShell slug={slug} hero={false}>
      {children}
    </BrandedShell>
  );
}
