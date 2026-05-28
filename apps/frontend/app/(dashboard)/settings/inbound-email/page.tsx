"use client";

/**
 * Phase 34g — Email-to-apply configuration page.
 *
 * Shows the tenant their unique inbound address (jobs+<slug>@<our-domain>)
 * + setup instructions for routing email at their provider + the webhook
 * URL they'd paste into SendGrid/Mailgun/Postmark.
 *
 * No backend "settings" to save here — the address is derived from the
 * tenant slug, and the webhook is set up at the email provider, not here.
 * This page is documentation + a copy-the-address button.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function InboundEmailPage() {
  const { user } = useCurrentUser();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (user?.tenant?.slug) setSlug(user.tenant.slug);
  }, [user]);

  const inboundDomain = process.env.NEXT_PUBLIC_INBOUND_EMAIL_DOMAIN ?? "jobs.cdc-ats.local";
  const address = slug ? `jobs+${slug}@${inboundDomain}` : "jobs+<your-slug>@<your-domain>";
  const sendgridUrl = `${API_BASE.replace(/\/api$/, "")}/api/inbound-email/sendgrid`;
  const mailgunUrl = `${API_BASE.replace(/\/api$/, "")}/api/inbound-email/mailgun`;
  const postmarkUrl = `${API_BASE.replace(/\/api$/, "")}/api/inbound-email/postmark`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/settings" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email-to-apply</h1>
          <p className="text-muted-foreground text-sm">
            Forward a resume to this address and it becomes a candidate in your pool.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" /> Your inbound address</CardTitle>
          <CardDescription className="text-xs">
            Anyone (you, your candidates, your hiring managers) can forward an email here.
            We parse the sender, attach any PDF/DOC/DOCX, and create the candidate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm font-mono break-all">{address}</code>
            <Button variant="outline" size="icon" onClick={() => copy(address, "Address")} title="Copy"><Copy className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Setup (one-time)</CardTitle>
          <CardDescription className="text-xs">
            We support SendGrid Inbound Parse, Mailgun Routes, and Postmark Inbound. Pick whichever your team uses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SendGrid */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">SendGrid Inbound Parse</h3>
              <a href="https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Add MX record for <code className="text-foreground">{inboundDomain}</code> pointing at <code className="text-foreground">mx.sendgrid.net</code></li>
              <li>SendGrid Dashboard → Settings → Inbound Parse → Add Host & URL</li>
              <li>Hostname: <code className="text-foreground">{inboundDomain}</code></li>
              <li>URL: paste below</li>
            </ol>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded border bg-muted/40 px-2 py-1 text-xs font-mono break-all">{sendgridUrl}</code>
              <Button variant="outline" size="icon" onClick={() => copy(sendgridUrl, "SendGrid URL")} title="Copy"><Copy className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {/* Mailgun */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">Mailgun Routes</h3>
              <a href="https://documentation.mailgun.com/en/latest/user_manual.html#routes" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Mailgun Dashboard → Receiving → Routes → Create Route</li>
              <li>Filter expression: <code className="text-foreground">match_recipient(&quot;{address}&quot;)</code></li>
              <li>Action: <code className="text-foreground">forward(&quot;{mailgunUrl}&quot;)</code> + <code className="text-foreground">store()</code></li>
              <li>Set <code className="text-foreground">MAILGUN_WEBHOOK_SIGNING_KEY</code> env on your deploy</li>
            </ol>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded border bg-muted/40 px-2 py-1 text-xs font-mono break-all">{mailgunUrl}</code>
              <Button variant="outline" size="icon" onClick={() => copy(mailgunUrl, "Mailgun URL")} title="Copy"><Copy className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {/* Postmark */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">Postmark Inbound</h3>
              <a href="https://postmarkapp.com/developer/user-guide/inbound/configure-an-inbound-server" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Postmark Dashboard → Inbound → New Inbound Stream</li>
              <li>Inbound Webhook URL: paste below</li>
              <li>(Optional) Set <code className="text-foreground">POSTMARK_WEBHOOK_TOKEN</code> env + add <code className="text-foreground">X-Postmark-Token</code> header in your stream</li>
            </ol>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded border bg-muted/40 px-2 py-1 text-xs font-mono break-all">{postmarkUrl}</code>
              <Button variant="outline" size="icon" onClick={() => copy(postmarkUrl, "Postmark URL")} title="Copy"><Copy className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">What gets imported</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li><strong className="text-foreground">Candidate:</strong> created/updated by the email's <em>From</em> address. Display name parsed from <em>Foo &lt;foo@x.com&gt;</em>; if absent, the local-part is used.</li>
            <li><strong className="text-foreground">Resume:</strong> any PDF / DOC / DOCX / TXT attachment forwarded to the parser. Multiple attachments? All processed.</li>
            <li><strong className="text-foreground">Source:</strong> tagged <code className="text-foreground">EMAIL_INBOUND</code> with the subject line as suffix.</li>
            <li><strong className="text-foreground">Idempotency:</strong> same From-address = same candidate row. Re-forwarding the same email updates the row, doesn't create a duplicate.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
