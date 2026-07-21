"use client";
// components/cd/requisition-edit-live.tsx
// Plain, dedicated "Edit requisition" form — NOT the IntakeScreen AI wizard (that
// screen is for authoring a brand-new JD from scratch, streaming trace and all;
// reusing it here would re-trigger "AI generates your JD" theater for a simple
// field edit) and NOT RequisitionBuilder (interview rounds / application form
// only). Structural precedent is scheduling-live.tsx: inline-styled inputs, one
// form-state object, a submit handler that PATCHes and navigates away.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter, useParams } from "next/navigation";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import { Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getRequisition, updateRequisition } from "@/lib/api";
import type { Requisition } from "@/lib/types";
import type { ReqStatusKey } from "./types";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: ReqStatusKey; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type FormState = {
  title: string; department: string; location: string;
  salaryMin: string; salaryMax: string;
  status: ReqStatusKey; description: string;
};

const inputStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", margin: "14px 0 6px", display: "block" };

function toForm(r: Requisition): FormState {
  return {
    title: r.title ?? "", department: r.department ?? "", location: r.location ?? "",
    salaryMin: r.salaryMin != null ? String(r.salaryMin) : "",
    salaryMax: r.salaryMax != null ? String(r.salaryMax) : "",
    status: (r.status as ReqStatusKey) ?? "DRAFT",
    description: r.description ?? "",
  };
}

export function RequisitionEditLive() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const req = useData<Requisition>(() => getRequisition(id), [id]);

  const [form, setForm] = useState<FormState | null>(null);
  const seeded = useRef(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Seed local form state once from the fetched requisition; useData's silent
  // background refetch must never clobber the user's in-progress edits.
  useEffect(() => {
    if (!seeded.current && req.data) {
      setForm(toForm(req.data));
      seeded.current = true;
    }
  }, [req.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const onCancel = () => router.push(`/requisitions/${id}`);

  const onSave = async () => {
    if (!form || saving) return;
    const title = form.title.trim(), department = form.department.trim(), location = form.location.trim();
    if (!title || !department || !location) {
      setErr("Title, department and location are required.");
      return;
    }
    const salaryMin = form.salaryMin.trim() ? Number(form.salaryMin) : undefined;
    const salaryMax = form.salaryMax.trim() ? Number(form.salaryMax) : undefined;
    if ((salaryMin != null && !Number.isFinite(salaryMin)) || (salaryMax != null && !Number.isFinite(salaryMax))) {
      setErr("Salary must be a number.");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await updateRequisition(id, {
        title, department, location, salaryMin, salaryMax,
        status: form.status, description: form.description,
      });
      toast.success("Requisition updated.");
      router.push(`/requisitions/${id}`);
    } catch (e: any) {
      toast.error(e?.message || "Could not save this requisition. Your edits are still here.");
    } finally {
      setSaving(false);
    }
  };

  if (req.loading || (req.data && !form)) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 30px" }}>
        <Skeleton className="h-8 w-64 rounded-[8px]" />
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-[11px]" />)}
        </div>
      </div>
    );
  }

  if (req.error || !req.data) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 30px" }}>
        <ErrorState title="Requisition not found" body="We could not load this requisition to edit." code={`GET /api/requisitions/${id}`} onRetry={req.reload} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 30px 60px" }}>
      <button onClick={onCancel} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 12, padding: 0 }}>
        <Icon name="chevsL" size={14} /> Back to requisition
      </button>

      <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Edit requisition</h1>
      <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
        <span className="mono">{req.data.id}</span> · updates apply immediately once saved.
      </p>

      <div style={{ marginTop: 20, borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 22, boxShadow: "var(--e1)" }}>
        <label style={{ ...labelStyle, marginTop: 0 }}>Title</label>
        <input value={form!.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="e.g. Senior Backend Engineer" />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Department</label>
            <input value={form!.department} onChange={(e) => set("department", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Location</label>
            <input value={form!.location} onChange={(e) => set("location", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Salary min (USD)</label>
            <input type="number" min={0} value={form!.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} className="mono" style={inputStyle} placeholder="Not set" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Salary max (USD)</label>
            <input type="number" min={0} value={form!.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} className="mono" style={inputStyle} placeholder="Not set" />
          </div>
        </div>

        <label style={labelStyle}>Status</label>
        <select value={form!.status} onChange={(e) => set("status", e.target.value as ReqStatusKey)} style={{ ...inputStyle, cursor: "pointer" }}>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <label style={labelStyle}>Description</label>
        <textarea value={form!.description} onChange={(e) => set("description", e.target.value)} rows={8}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}
          placeholder="Job description..." />

        {err && (
          <div style={{ marginTop: 14, display: "flex", gap: 9, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--danger-tint)", color: "var(--danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>
            <Icon name="flag" size={16} />{err}
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <Btn variant="primary" icon={saving ? "clock" : "check"} onClick={onSave} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save changes"}
          </Btn>
          <Btn variant="soft" onClick={onCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}
