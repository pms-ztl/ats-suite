"use client";
// app/(dashboard)/settings/retention/page.tsx, data retention policy.
import { Panel, Field, input, Toggle, Button } from "../_parts";
export default function RetentionPage() {
  return (
    <Panel title="Data retention" desc="How long candidate data is kept before automatic deletion." action={<Button variant="primary" size="sm">Save</Button>}>
      <Field label="Candidate data" hint="Applies to rejected and withdrawn candidates."><select className={input}><option>12 months</option><option>24 months</option><option>36 months</option></select></Field>
      <Field label="Résumé files"><select className={input}><option>12 months</option><option>24 months</option></select></Field>
      <Toggle label="Honor candidate deletion requests automatically" on />
      <Toggle label="Anonymize instead of delete for analytics" on />
    </Panel>
  );
}
