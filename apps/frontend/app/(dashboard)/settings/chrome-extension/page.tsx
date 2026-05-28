"use client";

/**
 * Phase 34g — Chrome extension install + setup instructions.
 *
 * Two distribution paths:
 *   1. Sideload (developer mode) — download a zip of packages/chrome-extension/
 *      and Load Unpacked. Quickest, works today, no Web Store review.
 *   2. Chrome Web Store — link out to your published listing once it exists.
 *
 * The zip is generated at deploy time by a build script — if it's missing,
 * the download button falls back to a "Setup pending" state with the
 * sideload instructions still visible.
 */
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Puzzle, Download, ExternalLink, Key, MessageSquare } from "lucide-react";

const CWS_URL = process.env.NEXT_PUBLIC_CHROME_EXT_CWS_URL ?? "";
const ZIP_URL = process.env.NEXT_PUBLIC_CHROME_EXT_ZIP_URL ?? "/chrome-extension/cdc-ats-linkedin.zip";

export default function ChromeExtensionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/settings" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LinkedIn Chrome extension</h1>
          <p className="text-muted-foreground text-sm">
            Add a "+ Add to CDC ATS" button on every LinkedIn profile page. One-click sourcing.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Puzzle className="h-4 w-4" /> Install</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CWS_URL ? (
            <div className="rounded-lg border bg-primary/5 border-primary/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">Recommended: Install from Chrome Web Store</p>
                  <p className="text-xs text-muted-foreground mt-1">One click. Auto-updates. Reviewed by Google.</p>
                </div>
                <Button asChild>
                  <a href={CWS_URL} target="_blank" rel="noreferrer" className="gap-1.5">
                    <ExternalLink className="h-4 w-4" /> Open in Web Store
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 p-4">
              <p className="text-sm font-medium">Chrome Web Store listing not yet published.</p>
              <p className="text-xs text-muted-foreground mt-1">Use the sideload method below until the listing goes live.</p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <p className="font-medium text-sm mb-2">Sideload (works today)</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4 mb-3">
              <li>Download the extension package (button below)</li>
              <li>Unzip it somewhere you won't delete (e.g. <code className="text-foreground">~/cdc-ats-extension/</code>)</li>
              <li>Open Chrome → <code className="text-foreground">chrome://extensions/</code></li>
              <li>Toggle <strong className="text-foreground">Developer mode</strong> (top-right)</li>
              <li>Click <strong className="text-foreground">Load unpacked</strong> → pick the unzipped folder</li>
            </ol>
            <Button asChild variant="outline" className="gap-1.5">
              <a href={ZIP_URL} download>
                <Download className="h-4 w-4" /> Download cdc-ats-linkedin.zip
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4" /> First-time setup</CardTitle>
          <CardDescription className="text-xs">After installing, the extension needs an API key.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-4">
            <li>Click the CDC ATS icon in your Chrome toolbar (puzzle-piece menu if it's not pinned)</li>
            <li>Paste your <strong className="text-foreground">API base URL</strong>: <code className="text-foreground">{(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api")}</code></li>
            <li>
              Paste an <strong className="text-foreground">API key</strong>. Create one at{" "}
              <Link href="/settings/api-keys" className="text-primary hover:underline">Settings → API keys</Link>{" "}
              (use a memorable name like "LinkedIn extension")
            </li>
            <li>Click <strong className="text-foreground">Save</strong>, then <strong className="text-foreground">Test connection</strong></li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-4">
            <li>Browse to any LinkedIn profile (<code className="text-foreground">linkedin.com/in/&lt;name&gt;</code>)</li>
            <li>Click the floating <Badge variant="outline" className="text-2xs mx-1">+ Add to CDC ATS</Badge> button (bottom-right)</li>
            <li>Button shows ✓ when imported. Candidate appears in your pool with source = <code className="text-foreground">LINKEDIN</code></li>
          </ol>
          <div className="mt-4 rounded-md bg-muted/30 border p-3 text-2xs text-muted-foreground">
            <strong className="text-foreground">Note on emails:</strong> LinkedIn doesn't expose emails publicly.
            We synthesize a placeholder address from the LinkedIn vanity slug
            (e.g. <code className="text-foreground">alex-chen.linkedin@unknown.local</code>).
            When the candidate later applies via your career page with their real email,
            the system links the records.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
