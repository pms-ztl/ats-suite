"use client";
// app/(dashboard)/settings/features/page.tsx, feature flags.
import { Panel, Toggle } from "../_parts";
export default function FeaturesPage() {
  return (
    <Panel title="Feature flags" desc="Turn capabilities on for this workspace. Changes apply immediately.">
      <Toggle label="AI sourcing" on />
      <Toggle label="Copilot assistant" on />
      <Toggle label="Adverse-impact monitoring" on />
      <Toggle label="Candidate self-scheduling" />
      <Toggle label="Internal mobility engine" />
      <Toggle label="Blind / bias-reduced review by default" />
    </Panel>
  );
}
