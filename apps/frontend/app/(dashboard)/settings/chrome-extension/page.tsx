"use client";
// app/(dashboard)/settings/chrome-extension/page.tsx, sourcing extension.
import { Panel, Toggle, Button } from "../_parts";
export default function ChromeExtensionPage() {
  return (
    <Panel title="Chrome extension" desc="Source candidates from LinkedIn and the web straight into TalentFlow." action={<Button variant="primary" size="sm">Install extension</Button>}>
      <Toggle label="Allow one-click add to requisition" on />
      <Toggle label="Auto-run the candidate-screener on add" />
      <Toggle label="Capture public profile links only" on />
    </Panel>
  );
}
