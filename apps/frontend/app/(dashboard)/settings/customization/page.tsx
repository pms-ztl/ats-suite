"use client";
// Modules H + I authoring. An admin relabels the pipeline stages (Module H) and
// sets the field-visibility matrix (Module I); both persist into the tenant's
// UiConfig blob via PUT /api/me/ui-config (module-gated `ui-customization`). The
// read paths (candidates board, requisition/candidate screens) pick the changes
// up live via useUiConfig. Honest result: "Saved" only on 200; plan/permission/
// network failures are surfaced truthfully — never faked.
import { useEffect, useMemo, useState } from "react";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import type { UiConfig } from "@cdc-ats/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

// Canonical pipeline (id + the shipped default label/color). A tenant only edits labels.
const CANON: { id: string; label: string; color: string }[] = [
  { id: "APPLIED", label: "Applied", color: "#9aa5b1" },
  { id: "SCREENED", label: "Screened", color: "#3b82f6" },
  { id: "PHONE_SCREEN", label: "Phone screen", color: "#3b82f6" },
  { id: "ASSESSMENT", label: "Assessment", color: "#8b5cf6" },
  { id: "INTERVIEW", label: "Interview", color: "#8b5cf6" },
  { id: "TECHNICAL_ROUND", label: "Technical round", color: "#8b5cf6" },
  { id: "HR_ROUND", label: "HR round", color: "#0ea5e9" },
  { id: "FINAL_REVIEW", label: "Final review", color: "#0ea5e9" },
  { id: "OFFER", label: "Offer", color: "#10b981" },
  { id: "HIRED", label: "Hired", color: "#22c55e" },
];

const FIELDS: { key: string; label: string }[] = [
  { key: "salary", label: "Salary / compensation" },
  { key: "alignmentScore", label: "AI alignment score" },
  { key: "assessmentScores", label: "Assessment scores" },
  { key: "interviewNotes", label: "Interview notes" },
  { key: "recruiterNotes", label: "Recruiter notes" },
  { key: "analytics", label: "Analytics & reports" },
  { key: "candidatePii", label: "Candidate PII" },
];
const ROLES = ["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"];

export default function CustomizationSettingsPage() {
  const { config, refresh } = useUiConfig();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [rules, setRules] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Seed from the resolved config once it loads.
  useEffect(() => {
    const stageLabels: Record<string, string> = {};
    for (const s of config?.workflow?.stages ?? []) stageLabels[s.canonical] = s.label;
    setLabels(stageLabels);
    setRules((config?.visibility?.rules as any) ?? {});
  }, [config]);

  const labelFor = (id: string) => labels[id] ?? CANON.find((c) => c.id === id)?.label ?? id;
  // canSee = checked. Absent rule entry defaults to visible (checked).
  const visible = (field: string, role: string) => rules?.[field]?.[role] !== false;
  const toggle = (field: string, role: string) => {
    setRules((prev) => {
      const currentlyVisible = prev?.[field]?.[role] !== false; // absent = visible
      const next = { ...prev, [field]: { ...(prev[field] ?? {}) } };
      next[field][role] = !currentlyVisible; // flip to the opposite
      return next;
    });
  };

  const save = async () => {
    setSaving(true); setResult(null);
    // Build the workflow.stages (all 8 canonical, with edited labels) + visibility.rules.
    const stages = CANON.map((c) => ({ id: c.id, canonical: c.id as any, label: labelFor(c.id), color: c.color }));
    const nextDoc: UiConfig = {
      ...(config as UiConfig),
      workflow: { ...(config?.workflow ?? {}), stages, approvals: config?.workflow?.approvals ?? {} },
      visibility: { rules: rules as any },
    };
    try {
      const res = await fetch(`${API_BASE}/me/ui-config`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json", ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) },
        body: JSON.stringify(nextDoc),
      });
      if (res.ok) { setResult("Saved."); refresh(); }
      else if (res.status === 402) setResult("This requires the UI customization module (Enterprise plan).");
      else if (res.status === 403) setResult("You need admin permission to change this.");
      else setResult(`Could not save (HTTP ${res.status}).`);
    } catch { setResult("Network error — not saved."); }
    finally { setSaving(false); }
  };

  const th: React.CSSProperties = { padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "var(--ink-2)", textAlign: "center" };

  return (
    <div className="cd-page">
      <h1 style={{ margin: "0 0 4px", fontSize: 24 }}>Workflow & visibility</h1>
      <p style={{ margin: "0 0 22px", color: "var(--ink-3)", fontSize: 13.5 }}>
        Rename your hiring stages and control which roles see sensitive fields. Changes apply across the app.
      </p>

      {/* Module H — stage labels */}
      <section style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Pipeline stage labels</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {CANON.map((c) => (
            <label key={c.id} style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>{c.id}</span>
              <input value={labelFor(c.id)} onChange={(e) => setLabels((p) => ({ ...p, [c.id]: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 13 }} />
            </label>
          ))}
        </div>
      </section>

      {/* Module I — visibility matrix */}
      <section style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 16 }}>Field visibility by role</h2>
        <p style={{ margin: "0 0 12px", color: "var(--ink-3)", fontSize: 12.5 }}>Checked = visible. Admins and platform operators always see everything.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left" }}>Field</th>
                {ROLES.map((r) => <th key={r} style={th}>{r.replace("_", " ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.key} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{f.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} style={{ padding: "8px 10px", textAlign: "center" }}>
                      <input type="checkbox" checked={visible(f.key, r)} onChange={() => toggle(f.key, r)} aria-label={`${f.label} visible to ${r}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => void save()} disabled={saving}
          style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#107a57", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {result && <span style={{ fontSize: 13, color: result === "Saved." ? "#107a57" : "var(--ink-2)" }}>{result}</span>}
      </div>
    </div>
  );
}
