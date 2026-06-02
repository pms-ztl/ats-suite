"use client";
// app/(dashboard)/settings/page.tsx, General workspace settings.
import { Panel, Field, input, Button } from "./_parts";

export default function GeneralSettingsPage() {
  return (
    <>
      <Panel title="Workspace" desc="Your organization's identity across TalentFlow." action={<Button variant="primary" size="sm">Save</Button>}>
        <Field label="Organization name"><input className={input} defaultValue="Northwind Talent" /></Field>
        <Field label="Primary domain" hint="Used for SSO discovery and candidate email matching."><input className={input} defaultValue="northwind.co" /></Field>
        <Field label="Default time zone"><select className={input}><option>America/Chicago</option><option>America/New_York</option><option>UTC</option></select></Field>
      </Panel>
      <Panel title="Region & data residency" desc="Where your candidate data is stored.">
        <Field label="Storage region"><select className={input}><option>United States</option><option>European Union</option></select></Field>
      </Panel>
    </>
  );
}
