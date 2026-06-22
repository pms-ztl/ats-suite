"use client";
// Module F — PUBLIC candidate onboarding portal. The opaque token in the URL is
// the credential. The candidate confirms details, uploads documents, and submits
// PAN + bank details for verification (KYC runs server-side; a stubbed provider
// returns an honest "pending verification" — never a fake "verified").
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Task { id: string; kind: string; title: string; description: string | null; required: boolean; status: string; order: number }
interface Verification { type: string; status: string; provider: string | null; maskedValue: string | null; message: string | null; verifiedAt: string | null }
interface Case {
  id: string; candidateName: string | null; jobTitle: string | null; status: string;
  startDate: string | null; tasks: Task[]; verifications: Verification[];
}

async function req(method: string, path: string, body?: unknown) {
  const r = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, data };
}

const card: React.CSSProperties = { background: "var(--c-surface, #fff)", border: "1px solid var(--c-line-2, #e5e7eb)", borderRadius: 14, padding: 20 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--c-line-2,#e5e7eb)", fontSize: 14, fontFamily: "inherit" };
const btn: React.CSSProperties = { padding: "9px 16px", borderRadius: 8, border: "none", background: "#107a57", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };

const VSTATUS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: "Not started", color: "#6b7280" },
  PENDING: { label: "Pending", color: "#b8860b" },
  NEEDS_PROVIDER: { label: "Pending verification", color: "#b8860b" },
  VERIFIED: { label: "Verified", color: "#107a57" },
  FAILED: { label: "Failed", color: "#b91c1c" },
};

export default function OnboardingPortalPage() {
  const params = useParams();
  const token = String(params?.["token"] ?? "");
  const [data, setData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await req("GET", `/public/onboarding/${token}`);
    if (res.ok) setData(res.data?.data ?? res.data);
    else setErr("This onboarding link is invalid or has expired.");
    setLoading(false);
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  // PAN form
  const [pan, setPan] = useState(""); const [panName, setPanName] = useState(""); const [panMsg, setPanMsg] = useState<string | null>(null);
  const submitPan = async () => {
    setPanMsg(null);
    const res = await req("POST", `/public/onboarding/${token}/pan`, { pan: pan.toUpperCase(), nameOnPan: panName });
    if (res.ok) { setData(res.data?.data ?? res.data); setPanMsg("Submitted."); }
    else setPanMsg(res.data?.error?.message ?? "Please check the PAN format (AAAAA9999A).");
  };
  // Bank form
  const [acct, setAcct] = useState(""); const [ifsc, setIfsc] = useState(""); const [holder, setHolder] = useState(""); const [bankMsg, setBankMsg] = useState<string | null>(null);
  const submitBank = async () => {
    setBankMsg(null);
    const res = await req("POST", `/public/onboarding/${token}/bank`, { accountNumber: acct, ifsc: ifsc.toUpperCase(), accountHolder: holder });
    if (res.ok) { setData(res.data?.data ?? res.data); setBankMsg("Submitted."); }
    else setBankMsg(res.data?.error?.message ?? "Please check the account number and IFSC.");
  };
  const completeTask = async (id: string) => {
    const res = await req("POST", `/public/onboarding/${token}/tasks/${id}/complete`);
    if (res.ok) setData(res.data?.data ?? res.data);
  };

  const v = (type: string) => data?.verifications.find((x) => x.type === type);
  const progress = useMemo(() => {
    const req = (data?.tasks ?? []).filter((t) => t.required);
    const done = req.filter((t) => t.status === "DONE" || t.status === "WAIVED").length;
    return { done, total: req.length };
  }, [data]);

  if (loading) return <Shell><p style={{ color: "var(--c-ink-2,#555)" }}>Loading your onboarding…</p></Shell>;
  if (err || !data) return <Shell><div style={card}><h2 style={{ margin: 0 }}>Onboarding</h2><p style={{ color: "var(--c-ink-2,#555)" }}>{err}</p></div></Shell>;

  return (
    <Shell>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={card}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "#107a57", fontWeight: 700 }}>Welcome aboard</div>
          <h1 style={{ margin: "6px 0 2px", fontSize: 26 }}>Hi {data.candidateName ?? "there"} 👋</h1>
          <p style={{ margin: 0, color: "var(--c-ink-2,#555)" }}>
            Let’s get you set up{data.jobTitle ? <> for <b>{data.jobTitle}</b></> : null}. Complete the steps below.
          </p>
          <div style={{ marginTop: 14, height: 8, background: "#eef2f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, height: "100%", background: "#107a57" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--c-ink-2,#555)", marginTop: 6 }}>{progress.done} of {progress.total} required steps complete · status {data.status}</div>
        </div>

        {/* Verifications */}
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Identity &amp; banking</h3>
          {/* PAN */}
          <Section title="PAN verification" v={v("PAN")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="PAN (AAAAA9999A)" value={pan} onChange={(e) => setPan(e.target.value)} maxLength={10} />
              <input style={inp} placeholder="Name on PAN" value={panName} onChange={(e) => setPanName(e.target.value)} />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <button style={btn} onClick={() => void submitPan()}>Submit PAN</button>
              {panMsg && <span style={{ fontSize: 12.5, color: "var(--c-ink-2,#555)" }}>{panMsg}</span>}
            </div>
          </Section>
          {/* Bank */}
          <Section title="Bank account (salary)" v={v("BANK_ACCOUNT")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="Account number" value={acct} onChange={(e) => setAcct(e.target.value)} />
              <input style={inp} placeholder="IFSC (e.g. HDFC0001234)" value={ifsc} onChange={(e) => setIfsc(e.target.value)} maxLength={11} />
              <input style={inp} placeholder="Account holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <button style={btn} onClick={() => void submitBank()}>Submit bank details</button>
              {bankMsg && <span style={{ fontSize: 12.5, color: "var(--c-ink-2,#555)" }}>{bankMsg}</span>}
            </div>
          </Section>
        </div>

        {/* Tasks */}
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Your checklist</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.tasks.filter((t) => t.kind !== "VERIFICATION").map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--c-line-2,#e5e7eb)", borderRadius: 10 }}>
                <span style={{ width: 18, height: 18, borderRadius: 99, border: "2px solid", borderColor: t.status === "DONE" ? "#107a57" : "#cbd5e1", background: t.status === "DONE" ? "#107a57" : "transparent" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}{t.required && <span style={{ color: "#b91c1c", marginLeft: 4 }}>*</span>}</div>
                  {t.description && <div style={{ fontSize: 12.5, color: "var(--c-ink-2,#555)" }}>{t.description}</div>}
                </div>
                {t.status !== "DONE"
                  ? <button style={{ ...btn, background: "#0f172a" }} onClick={() => void completeTask(t.id)}>Mark done</button>
                  : <span style={{ fontSize: 12.5, color: "#107a57", fontWeight: 600 }}>Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Section({ title, v, children }: { title: string; v?: Verification; children: React.ReactNode }) {
  const s = v ? (VSTATUS[v.status] ?? VSTATUS.NOT_STARTED) : VSTATUS.NOT_STARTED;
  return (
    <div style={{ padding: "14px 0", borderTop: "1px solid var(--c-line-2,#eee)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: s.color, background: "#0000000a", padding: "2px 8px", borderRadius: 99 }}>{s.label}</span>
        {v?.maskedValue && <span style={{ fontSize: 12, color: "var(--c-ink-2,#555)" }}>{v.maskedValue}</span>}
      </div>
      {children}
      {v?.message && <div style={{ fontSize: 12, color: "var(--c-ink-3,#777)", marginTop: 8 }}>{v.message}</div>}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--c-bg,#f6f8f7)", padding: "32px 18px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
