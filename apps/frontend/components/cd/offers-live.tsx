"use client";
// components/cd/offers-live.tsx
// Wires the verbatim CD Offers to the gateway: listOffers() + listRequisitions() ->
// OffersData (list rows). The "+ Create offer" button opens a real create dialog
// (candidate + requisition + base salary) that POSTs to /api/offers (createOffer)
// and reloads the list, so a genuine DRAFT offer is created server-side.
import { useState, type CSSProperties } from "react";
import { Offers } from "./screens/Offers";
import { useData } from "@/lib/use-data";
import { listOffers, listRequisitions, listCandidates, createOffer } from "@/lib/api";
import type { Offer as GwOffer, Requisition, Candidate, OfferStatus } from "@/lib/types";
import type { OfferRow, OfferStatusKey } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const STATUS: Record<OfferStatus, OfferStatusKey> = {
  DRAFT: "draft", PENDING_APPROVAL: "pending", APPROVED: "approved",
  SENT: "sent", ACCEPTED: "accepted", DECLINED: "declined", EXPIRED: "declined",
};

const fieldStyle: CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-line-2)",
  background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 13.5, fontFamily: "var(--font-sans)", marginTop: 6,
};
const labelStyle: CSSProperties = { fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--c-ink-3)" };

export function OffersLive() {
  const offersD = useData<GwOffer[]>(listOffers);
  const reqs = useData<Requisition[]>(listRequisitions);
  const cands = useData<Candidate[]>(listCandidates);
  const titles = reqTitleMap(reqs.data);
  const candById = new Map((cands.data ?? []).map((c) => [c.id, c]));

  const [open, setOpen] = useState(false);
  const [candId, setCandId] = useState("");
  const [reqId, setReqId] = useState("");
  const [salary, setSalary] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const offers: OfferRow[] = (offersD.data ?? []).map((o) => {
    const name = candById.get(o.candidateId)?.name ?? o.candidateId;
    return {
      id: o.id,
      ini: initials(name),
      name,
      role: titles[o.requisitionId] ?? "",
      reqId: o.requisitionId,
      base: o.baseSalary,
      status: STATUS[o.status] ?? "draft",
      expires: "",
    };
  });

  const submit = async () => {
    if (!candId || !reqId || !salary || Number(salary) <= 0) { setErr("Pick a candidate and requisition, and enter a base salary."); return; }
    setSaving(true); setErr(null);
    try {
      await createOffer({ candidateId: candId, requisitionId: reqId, baseSalary: Math.round(Number(salary)) });
      setOpen(false); setCandId(""); setReqId(""); setSalary("");
      offersD.reload();
    } catch (e: any) {
      setErr(e?.message || "Could not create the offer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Offers data={{ offers }} onCreate={() => { setErr(null); setOpen(true); }} />
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,20,32,.45)", display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", padding: 22, boxShadow: "var(--e3)" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--fs-lg)", fontWeight: 800, letterSpacing: "-0.01em" }}>Create offer</h2>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--c-ink-2)" }}>Creates a DRAFT offer for the chosen candidate and requisition.</p>
            <label style={labelStyle}>Candidate
              <select value={candId} onChange={(e) => setCandId(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                <option value="">Select a candidate…</option>
                {(cands.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div style={{ height: 12 }} />
            <label style={labelStyle}>Requisition
              <select value={reqId} onChange={(e) => setReqId(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                <option value="">Select a requisition…</option>
                {(reqs.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </label>
            <div style={{ height: 12 }} />
            <label style={labelStyle}>Base salary (USD)
              <input type="number" min={1} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 180000" style={fieldStyle} />
            </label>
            {err && <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--c-warn)" }}>{err}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} disabled={saving} style={{ padding: "9px 16px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Cancel</button>
              <button onClick={() => void submit()} disabled={saving} style={{ padding: "9px 18px", borderRadius: "var(--r-pill)", border: "none", background: "var(--c-brand)", color: "var(--c-on-brand)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", opacity: saving ? 0.6 : 1 }}>{saving ? "Creating…" : "Create offer"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
