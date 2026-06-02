"use client";
// app/(dashboard)/settings/inbound-email/page.tsx, inbound email address for applications.
import { Panel, Field, input, Toggle, Button } from "../_parts";
export default function InboundEmailPage() {
  return (
    <Panel title="Inbound email" desc="Forward applications to a TalentFlow address and we parse them automatically." action={<Button variant="primary" size="sm">Save</Button>}>
      <Field label="Your inbound address" hint="Candidates or job boards can email here; the resume-parser ingests attachments."><input className={input} readOnly defaultValue="apply+northwind@inbound.talentflow.com" /></Field>
      <Toggle label="Auto-create candidates from inbound email" on />
      <Toggle label="Require a matching open requisition" />
    </Panel>
  );
}
