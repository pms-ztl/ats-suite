"use client";
// app/(dashboard)/settings/branding/page.tsx, Branding with live preview.
import { useState } from "react";
import { Panel, Field, input, Button } from "../_parts";
import { Card } from "@/components/aurora";

export default function BrandingSettingsPage() {
  const [name, setName] = useState("Northwind Talent");
  const [color, setColor] = useState("#16916a");
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <Panel title="Brand" desc="How your careers site and candidate emails look." action={<Button variant="primary" size="sm">Save</Button>}>
          <Field label="Display name"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Accent color"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-20 rounded border border-line-2 bg-surface" /></Field>
          <Field label="Logo"><input type="file" className="text-sm" /></Field>
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card material="clay" className="rounded-2xl p-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-3">Live preview</div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-3 h-8 w-8 rounded-lg" style={{ background: color }} />
            <div className="text-base font-bold">{name}</div>
            <div className="text-xs text-ink-3">Careers</div>
            <button className="mt-3 rounded-pill px-4 py-2 text-sm font-semibold text-white" style={{ background: color }}>Apply now</button>
          </div>
        </Card>
      </aside>
    </div>
  );
}
