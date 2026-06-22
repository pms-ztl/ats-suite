"use client";
// Module E — the "Hire Candidate" / "Reject" actions. One click advances the
// application's stage and fires the backend workflow (offer/comms via NATS) —
// no external system. Honest: disabled when there is no application id; reflects
// the real result.
import * as React from "react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function post(path: string, body?: unknown) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return r.ok;
}

export function HireActions({ applicationId, stage }: { applicationId?: string | null; stage?: string }) {
  const [busy, setBusy] = React.useState<null | "hire" | "reject">(null);
  const [done, setDone] = React.useState<null | "hired" | "rejected">(null);

  if (stage === "HIRED" || done === "hired") return <span style={{ fontSize: 12.5, fontWeight: 700, color: "#107a57" }}>● Hired</span>;
  if (stage === "REJECTED" || done === "rejected") return <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b91c1c" }}>Rejected</span>;

  const disabled = !applicationId || busy !== null;
  const hire = async () => {
    if (!applicationId) return;
    setBusy("hire");
    const ok = await post(`/applications/${applicationId}/hire`);
    setBusy(null);
    if (ok) setDone("hired");
  };
  const reject = async () => {
    if (!applicationId) return;
    setBusy("reject");
    const ok = await post(`/applications/${applicationId}/reject`, { reason: "NOT_SELECTED" });
    setBusy(null);
    if (ok) setDone("rejected");
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => void reject()}>
        {busy === "reject" ? "…" : "Reject"}
      </Button>
      <Button size="sm" disabled={disabled} onClick={() => void hire()} title={!applicationId ? "No application on file" : "Hire this candidate"}>
        {busy === "hire" ? "Hiring…" : "Hire candidate"}
      </Button>
    </div>
  );
}
