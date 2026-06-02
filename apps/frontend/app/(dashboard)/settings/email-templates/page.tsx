"use client";
// app/(dashboard)/settings/email-templates/page.tsx, transactional email templates.
import { Panel, Field, input, Button } from "../_parts";

const TEMPLATES = ["Application received", "Moved to interview", "Rejection (respectful)", "Offer extended"];

export default function EmailTemplatesPage() {
  return (
    <Panel title="Email templates" desc="Edit the messages candidates receive. AI can draft, you approve every word." action={<Button variant="ai" size="sm">Draft with AI</Button>}>
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        <ul className="rounded-lg border border-line bg-surface-2 p-1 text-sm">
          {TEMPLATES.map((t, i) => <li key={t} className={"rounded px-3 py-2 " + (i === 0 ? "bg-surface font-semibold" : "text-ink-2")}>{t}</li>)}
        </ul>
        <div>
          <Field label="Subject"><input className={input} defaultValue="We received your application" /></Field>
          <Field label="Body"><textarea rows={8} className="w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" defaultValue={"Hi {{first_name}},\n\nThanks for applying to {{role}}. Our team is reviewing your application and we will be in touch."} /></Field>
          <Button variant="primary" size="sm">Save template</Button>
        </div>
      </div>
    </Panel>
  );
}
