"use client";
// app/(dashboard)/settings/integrations/page.tsx, connector grid.
import { Panel, Button } from "../_parts";
import { Card } from "@/components/aurora";

const CONNECTORS = [
  ["Slack", "Notify channels on key events", true],
  ["Google Calendar", "Schedule interviews", true],
  ["Workday", "Sync hires to HRIS", false],
  ["Greenhouse", "Import candidates", false],
  ["LinkedIn", "Source and post roles", true],
  ["Zoom", "Video interview links", false],
] as const;

export default function IntegrationsPage() {
  return (
    <Panel title="Integrations" desc="Connect TalentFlow to the tools your team already uses.">
      <div className="grid gap-3 sm:grid-cols-2">
        {CONNECTORS.map(([name, desc, on]) => (
          <Card key={name} material="flat" className="flex items-center gap-3 rounded-xl border border-line p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 font-bold">{name[0]}</span>
            <div className="min-w-0 flex-1"><div className="font-semibold">{name}</div><div className="text-xs text-ink-3">{desc}</div></div>
            <Button variant={on ? "soft" : "primary"} size="sm">{on ? "Connected" : "Connect"}</Button>
          </Card>
        ))}
      </div>
    </Panel>
  );
}
