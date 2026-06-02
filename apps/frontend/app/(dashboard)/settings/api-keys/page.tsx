"use client";
// app/(dashboard)/settings/api-keys/page.tsx, API keys (secret shown once).
import { useState } from "react";
import { Panel, Button } from "../_parts";

interface Key { id: string; name: string; prefix: string; created: string; }
const KEYS: Key[] = [
  { id: "k1", name: "Production ingest", prefix: "tf_live_8Kf2", created: "May 24, 2026" },
  { id: "k2", name: "Analytics read", prefix: "tf_live_2Qm9", created: "Apr 11, 2026" },
];

export default function ApiKeysPage() {
  const [secret, setSecret] = useState<string | null>(null);
  return (
    <Panel title="API keys" desc="Programmatic access to the TalentFlow API." action={<Button variant="primary" size="sm" onClick={() => setSecret("tf_live_8Kf2pQ9mZx4Lr7vN3wT6yH1bD5sA0eR")}>Generate key</Button>}>
      {secret && (
        <div className="mb-4 rounded-lg border border-warn/40 bg-warn-tint p-3">
          <p className="mb-2 text-xs font-semibold text-warn">Copy this key now. For your security it will not be shown again.</p>
          <code className="block break-all rounded border border-line-strong bg-surface-2 p-2 font-mono text-sm">{secret}</code>
        </div>
      )}
      <ul className="divide-y divide-line">
        {KEYS.map((k) => (
          <li key={k.id} className="flex items-center justify-between py-3">
            <span><b className="text-sm">{k.name}</b><span className="block font-mono text-xs text-ink-3">{k.prefix}••••••••  ·  created {k.created}</span></span>
            <Button variant="danger" size="sm">Revoke</Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
