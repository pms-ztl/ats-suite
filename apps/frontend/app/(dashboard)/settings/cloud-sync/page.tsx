"use client";
// app/(dashboard)/settings/cloud-sync/page.tsx, cloud storage sync.
import { Panel, Field, input, Toggle, Button } from "../_parts";
export default function CloudSyncPage() {
  return (
    <Panel title="Cloud sync" desc="Back up résumés and exports to your own cloud storage." action={<Button variant="primary" size="sm">Connect</Button>}>
      <Field label="Provider"><select className={input}><option>Amazon S3</option><option>Google Cloud Storage</option><option>Azure Blob</option></select></Field>
      <Field label="Bucket / container"><input className={input} placeholder="talentflow-northwind" /></Field>
      <Toggle label="Sync résumé files" on />
      <Toggle label="Sync EEOC exports" />
    </Panel>
  );
}
