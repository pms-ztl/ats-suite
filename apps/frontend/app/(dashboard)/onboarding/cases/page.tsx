"use client";
// Module F — recruiter onboarding tracker. Lists the tenant's onboarding cases
// (opened automatically when an offer is accepted) with progress + verification
// status, and the shareable candidate portal link. Honest empty state.
import { useEffect, useMemo, useState } from "react";
import { ExportMenu } from "@/components/shared/export-menu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

interface CaseRow {
  id: string; candidateName: string | null; candidateEmail: string | null; jobTitle: string | null;
  status: string; startDate: string | null; createdAt: string;
  progress: { done: number; total: number };
  verifications: { type: string; status: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#6b7280", IN_PROGRESS: "#2563eb", BLOCKED: "#b45309", COMPLETED: "#107a57", CANCELLED: "#9ca3af",
};

export default function OnboardingCasesPage() {
  const [rows, setRows] = useState<CaseRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/onboarding-cases`, {
          credentials: "include",
          headers: { ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) },
        });
        if (!r.ok) { setError("Could not load onboarding cases."); setRows([]); return; }
        const d = await r.json();
        setRows(Array.isArray(d?.data) ? d.data : []);
      } catch { setError("Could not load onboarding cases."); setRows([]); }
    })();
  }, []);

  const exportTable = useMemo(() => () => ({
    filename: `onboarding-${new Date().toISOString().slice(0, 10)}`,
    title: "Onboarding cases",
    headers: ["Candidate", "Email", "Role", "Status", "Progress", "PAN", "Bank"],
    rows: (rows ?? []).map((c) => [
      c.candidateName ?? "", c.candidateEmail ?? "", c.jobTitle ?? "", c.status,
      `${c.progress.done}/${c.progress.total}`,
      c.verifications.find((v) => v.type === "PAN")?.status ?? "-",
      c.verifications.find((v) => v.type === "BANK_ACCOUNT")?.status ?? "-",
    ]),
  }), [rows]);

  return (
    <div className="cd-page" data-width="wide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Onboarding</h1>
          <p style={{ margin: "4px 0 0", color: "var(--ink-3)", fontSize: 13.5 }}>Post-offer onboarding cases — details, PAN &amp; bank verification, documents.</p>
        </div>
        <ExportMenu table={exportTable} disabled={!rows || rows.length === 0} />
      </div>

      {rows === null && <p style={{ color: "var(--ink-3)" }}>Loading…</p>}
      {rows !== null && rows.length === 0 && (
        <div style={{ border: "1px dashed var(--line)", borderRadius: 14, padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
          {error ?? "No onboarding cases yet. A case opens automatically when a candidate accepts an offer."}
        </div>
      )}
      {rows && rows.length > 0 && (
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["Candidate", "Role", "Status", "Progress", "Verifications", "Started"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontWeight: 600, color: "var(--ink-2)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 600 }}>{c.candidateName ?? "—"}</div>
                    <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{c.candidateEmail}</div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>{c.jobTitle ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: STATUS_COLOR[c.status] ?? "#6b7280" }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>{c.progress.done}/{c.progress.total}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {c.verifications.map((v) => (
                      <span key={v.type} style={{ fontSize: 11, marginRight: 8, color: v.status === "VERIFIED" ? "#107a57" : "var(--ink-3)" }}>
                        {v.type === "BANK_ACCOUNT" ? "Bank" : v.type}: {v.status}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-3)" }}>{c.startDate ? new Date(c.startDate).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
