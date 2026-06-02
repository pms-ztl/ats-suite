"use client";
// app/(dashboard)/requisitions/new/page.tsx, EXACT Claude Design "Aurora"
// requisition-intake showpiece (claude-design/req-intake.jsx): the basics
// (title/department/level/location/salary), the jd-author panel that drafts a
// description + required vs nice-to-have + inclusivity score + bias self-audit
// with one-click fixes, a paste-my-own path, custom screening criteria fed to
// the screener, and a live candidate/screener preview. AI accents in violet.
// Wired to the real gateway: generateJD() and createRequisition().
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing, Pill, Btn } from "@/components/aurora-kit";
import { Icon, Logo } from "@/components/aurora-icon";
import { generateJD, createRequisition } from "@/lib/api";

type Gen = Awaited<ReturnType<typeof generateJD>>;

const IMPORTANCE: Record<string, { label: string; tone: string; bg: string }> = {
  "nice-to-have": { label: "Nice-to-have", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  "important": { label: "Important", tone: "var(--c-info)", bg: "var(--c-info-tint)" },
  "must-have": { label: "Must-have", tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
};

const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };
const inputStyle: CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

type CF = { id: string; label: string; value: string; importance: string };
type Flag = { id: string; phrase: string; suggestion: string; applied: boolean };

/* chips input */
function Chips({ items, setItems, placeholder, tone = "var(--c-brand)", bg = "var(--c-brand-tint)" }: { items: string[]; setItems: (v: string[]) => void; placeholder: string; tone?: string; bg?: string }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (t && !items.includes(t)) setItems([...items, t]); setV(""); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", minHeight: 42, alignItems: "center" }}>
      {items.map((s) => (
        <span key={s} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "3px 7px 3px 10px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, color: tone, background: bg }}>
          {s}<button onClick={() => setItems(items.filter((x) => x !== s))} style={{ display: "grid", placeItems: "center", border: "none", background: "none", cursor: "pointer", color: tone, opacity: 0.7, padding: 0 }}><Icon name="x" size={12} /></button>
        </span>
      ))}
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder}
        style={{ flex: 1, minWidth: 120, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", padding: "3px 2px" }} />
    </div>
  );
}

/* labelled field */
function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--c-danger)" }}>*</span>}{hint && <span style={{ fontWeight: 400, color: "var(--c-ink-3)" }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* inclusivity meter */
function Inclusivity({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ScoreRing value={score} size={52} band="var(--c-ai)" label="incl." />
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>Inclusivity score</div>
        <div style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{score >= 90 ? "Strong, welcoming, unbiased language." : "Apply the suggested fixes to improve."}</div>
      </div>
    </div>
  );
}

/* bias flag row with one-click fix */
function BiasFlag({ f, onFix }: { f: Flag; onFix: (id: string) => void }) {
  return (
    <div style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: f.applied ? "var(--c-ok-tint)" : "var(--c-surface)", transition: "background var(--t)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, fontWeight: 700 }}>
          <Icon name={f.applied ? "check" : "flag"} size={13} style={{ color: f.applied ? "var(--c-ok)" : "var(--c-warn)" }} />
          {f.applied ? "Fixed" : "Bias flag"}
        </span>
        {!f.applied && <button onClick={() => onFix(f.id)} style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: "var(--c-ai-ink)", background: "var(--c-ai-tint)", border: "none", borderRadius: "var(--r-pill)", padding: "4px 10px", cursor: "pointer" }}><Icon name="bolt" size={12} />Apply fix</button>}
      </div>
      <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 6, lineHeight: 1.45 }}>
        {f.applied
          ? <>Replaced with <b style={{ color: "var(--c-ink)" }}>&ldquo;{f.suggestion}&rdquo;</b>.</>
          : <>&ldquo;<span style={{ color: "var(--c-warn)", fontWeight: 600 }}>{f.phrase}</span>&rdquo; &rarr; suggest <b style={{ color: "var(--c-ink)" }}>&ldquo;{f.suggestion}&rdquo;</b></>}
      </div>
    </div>
  );
}

/* custom field row */
function CFRow({ cf, onChange, onRemove }: { cf: CF; onChange: (cf: CF) => void; onRemove: (id: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 32px", gap: 9, alignItems: "center", animation: "rise .3s var(--ease-out)" }}>
      <input value={cf.label} onChange={(e) => onChange({ ...cf, label: e.target.value })} placeholder="Label, e.g. Must have fintech experience" style={{ ...inputStyle, fontWeight: 600 }} />
      <input value={cf.value} onChange={(e) => onChange({ ...cf, value: e.target.value })} placeholder="What good looks like" style={inputStyle} />
      <select value={cf.importance} onChange={(e) => onChange({ ...cf, importance: e.target.value })} style={{ ...inputStyle, cursor: "pointer", padding: "9px 8px" }}>
        {Object.keys(IMPORTANCE).map((k) => <option key={k} value={k}>{IMPORTANCE[k].label}</option>)}
      </select>
      <button onClick={() => onRemove(cf.id)} style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={15} /></button>
    </div>
  );
}

type St = {
  title: string; dept: string; level: string; location: string; min: number; max: number;
  mode: "ai" | "paste"; generated: boolean; description: string; required: string[]; niceToHave: string[];
  inclusivity: number; skills: string[]; customFields: CF[];
};

/* ---------- live preview ---------- */
function Preview({ st }: { st: St }) {
  const [mode, setMode] = useState<"candidate" | "screener">("candidate");
  const salary = st.min && st.max ? `$${st.min / 1000}k to $${st.max / 1000}k` : null;
  const reqs = st.generated ? st.required : (st.skills.length ? st.skills : []);
  const namedCF = st.customFields.filter((c) => c.label);
  return (
    <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--c-ink-3)", display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Live preview</span>
        <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r-pill)", padding: 2, border: "1px solid var(--c-line)" }}>
          {([["candidate", "Candidate", "users"], ["screener", "Screener", "sparkles"]] as const).map(([m, l, ic]) => (
            <button key={m} onClick={() => setMode(m)} style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "5px 11px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: mode === m ? (m === "screener" ? "var(--c-ai)" : "var(--c-surface)") : "transparent", color: mode === m ? (m === "screener" ? "var(--c-on-ai)" : "var(--c-ink)") : "var(--c-ink-3)", boxShadow: mode === m && m !== "screener" ? "var(--e1)" : "none" }}>
              <Icon name={ic} size={13} />{l}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowY: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
        {mode === "candidate" ? (
          <div>
            <div style={{ padding: "20px 22px", background: "radial-gradient(120% 120% at 0 0, var(--c-brand-tint-2), transparent 60%)", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}><Logo size={20} /><span style={{ fontWeight: 700, fontSize: 12.5 }}>Northwind Talent</span></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{st.title || "Job title"}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {st.dept && <Pill icon="briefcase">{st.dept}</Pill>}
                {st.location && <Pill icon="dot">{st.location}</Pill>}
                {salary
                  ? <Pill icon="card" tone="var(--c-brand)" bg="var(--c-brand-tint)" mono>{salary}</Pill>
                  : <Pill icon="flag" tone="var(--c-warn)" bg="var(--c-warn-tint)">salary not shown</Pill>}
              </div>
            </div>
            <div style={{ padding: "18px 22px", fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--c-ink-2)" }}>
              {st.description ? <p style={{ margin: "0 0 16px" }}>{st.description}</p> : <p style={{ margin: "0 0 16px", color: "var(--c-ink-3)", fontStyle: "italic" }}>The description will appear here as you write or generate it.</p>}
              {reqs.length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--c-ink)", marginBottom: 8 }}>What you&apos;ll need</div>
                <ul style={{ margin: "0 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{reqs.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </>}
              {st.generated && st.niceToHave.length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--c-ink)", marginBottom: 8 }}>Nice to have</div>
                <ul style={{ margin: "0 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{st.niceToHave.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </>}
              {namedCF.length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--c-ink)", marginBottom: 8 }}>Additional requirements</div>
                <ul style={{ margin: "0 0 18px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{namedCF.map((c) => <li key={c.id}>{c.label}{c.value ? `, ${c.value}` : ""}</li>)}</ul>
              </>}
              <button style={{ width: "100%", padding: "11px", borderRadius: "var(--r)", border: "none", background: "var(--c-brand)", color: "var(--c-on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Pill icon="sparkles" tone="var(--c-on-ai)" bg="var(--c-ai)">candidate-screener</Pill><span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>how the AI will score applicants</span></div>
            <p style={{ fontSize: 12, color: "var(--c-ink-2)", margin: "8px 0 14px", lineHeight: 1.5 }}>Every requirement below, including your custom fields, becomes a weighted row in each candidate&apos;s screening verdict.</p>
            {[...reqs.map((r) => ({ label: r, imp: "required", custom: false })), ...namedCF.map((c) => ({ label: c.label, imp: c.importance, custom: true }))].map((r, i, arr) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 10, alignItems: "center", padding: "9px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", gap: 7, alignItems: "center" }}>{r.custom && <Icon name="sparkles" size={12} style={{ color: "var(--c-ai)" }} />}{r.label}</span>
                <span className="mono" style={{ fontSize: 10.5, textAlign: "right", color: r.imp === "must-have" ? "var(--c-ai-ink)" : "var(--c-ink-3)", fontWeight: 600 }}>{Math.round(100 / Math.max(arr.length, 1))}% wt</span>
              </div>
            ))}
            {reqs.length === 0 && namedCF.length === 0 && <div style={{ textAlign: "center", color: "var(--c-ink-3)", fontSize: 12.5, padding: "20px 0" }}>Add requirements to see how screening will weight them.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- the intake screen ---------- */
export default function NewRequisitionPage() {
  const router = useRouter();
  const [st, setSt] = useState<St>({
    title: "", dept: "", level: "", location: "", min: 0, max: 0,
    mode: "ai", generated: false, description: "", required: [], niceToHave: [], inclusivity: 0, skills: [],
    customFields: [{ id: "cf1", label: "", value: "", importance: "important" }],
  });
  const [biasFlags, setBiasFlags] = useState<Flag[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const set = (patch: Partial<St>) => setSt((s) => ({ ...s, ...patch }));

  const generate = async () => {
    if (!st.title.trim() || generating) return;
    setGenerating(true); setGenError(false); setSaveError(false);
    try {
      const g: Gen = await generateJD(st.title);
      set({ generated: true, description: g.description, required: g.requiredSkills, niceToHave: g.niceToHave, inclusivity: g.inclusivityScore });
      setBiasFlags(g.biasFlags.map((f, i) => ({ id: `b${i}`, phrase: f.phrase, suggestion: f.suggestion, applied: false })));
    } catch {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  };

  const fixBias = (id: string) => {
    setBiasFlags((fs) => fs.map((f) => f.id === id ? { ...f, applied: true } : f));
    setSt((s) => ({ ...s, inclusivity: Math.min(100, s.inclusivity + 2) }));
  };

  const submit = async () => {
    if (!st.title.trim() || saving) return;
    setSaving(true); setSaveError(false);
    const impMap: Record<string, "nice" | "important" | "must"> = { "nice-to-have": "nice", "important": "important", "must-have": "must" };
    const body = {
      title: st.title.trim(),
      department: st.dept,
      location: st.location,
      employmentType: st.level,
      description: st.description,
      requiredSkills: st.generated ? st.required : st.skills,
      niceToHave: st.niceToHave,
      inclusivityScore: st.generated ? st.inclusivity : undefined,
      ...(st.min && st.max ? { salaryMin: st.min, salaryMax: st.max } : {}),
      customFields: st.customFields.filter((c) => c.label).map((c) => ({ label: c.label, value: c.value, importance: impMap[c.importance] })),
    };
    try {
      const created = await createRequisition(body);
      router.push(created?.id ? `/requisitions/${created.id}` : "/requisitions");
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  };

  const openNoSalary = !st.min || !st.max;
  const addCF = () => set({ customFields: [...st.customFields, { id: "cf" + Date.now(), label: "", value: "", importance: "important" }] });
  const updCF = (cf: CF) => set({ customFields: st.customFields.map((c) => c.id === cf.id ? cf : c) });
  const rmCF = (id: string) => set({ customFields: st.customFields.filter((c) => c.id !== id) });

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "flex", flexDirection: "column", borderRadius: "var(--r-2xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 26px", borderBottom: "1px solid var(--c-line)" }}>
          <button onClick={() => router.push("/requisitions")} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevsL" size={16} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>New requisition</h1><Pill mono tone="var(--c-ink-3)" bg="var(--c-surface-3)">draft</Pill></div>
          </div>
          <Btn variant="ghost" onClick={() => router.push("/requisitions")}>Save draft</Btn>
          <Btn variant="primary" icon="arrowUpRight" onClick={submit}>{saving ? "Posting..." : "Post job"}</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.85fr", gap: 0 }}>
          {/* form */}
          <div style={{ padding: "22px 26px 60px", display: "flex", flexDirection: "column", gap: 20, borderRight: "1px solid var(--c-line)" }}>
            {/* basics */}
            <section>
              <div style={{ ...labelStyle, marginBottom: 12 }}>The basics</div>
              <Field label="Job title" required>
                <input value={st.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Senior Backend Engineer" style={{ ...inputStyle, fontSize: "var(--fs-lg)", fontWeight: 700, padding: "11px 14px" }} />
              </Field>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <Field label="Department"><input value={st.dept} onChange={(e) => set({ dept: e.target.value })} placeholder="e.g. Payments" style={inputStyle} /></Field>
                <Field label="Level"><input value={st.level} onChange={(e) => set({ level: e.target.value })} placeholder="e.g. Senior (L5)" style={inputStyle} /></Field>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <Field label="Location"><input value={st.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Austin, TX / Remote (US)" style={inputStyle} /></Field>
                <Field label="Salary range" hint="USD / year">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={st.min || ""} onChange={(e) => set({ min: +e.target.value })} placeholder="min" className="mono" style={{ ...inputStyle, width: 100 }} />
                    <span style={{ color: "var(--c-ink-3)" }}>,</span>
                    <input type="number" value={st.max || ""} onChange={(e) => set({ max: +e.target.value })} placeholder="max" className="mono" style={{ ...inputStyle, width: 100 }} />
                  </div>
                </Field>
              </div>
              {openNoSalary && (
                <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 28%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
                  <Icon name="flag" size={14} style={{ color: "var(--c-warn)", flexShrink: 0 }} /><span><b style={{ color: "var(--c-ink)" }}>Pay transparency:</b> several states require a salary range on public posts. Add one before publishing as Open.</span>
                </div>
              )}
            </section>

            {/* description, two paths */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={labelStyle}>Job description</div>
                <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r-pill)", padding: 2, border: "1px solid var(--c-line)" }}>
                  {([["ai", "Let AI write it", "sparkles"], ["paste", "Paste my own", "fileText"]] as const).map(([m, l, ic]) => (
                    <button key={m} onClick={() => set({ mode: m })} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 12px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                      background: st.mode === m ? (m === "ai" ? "var(--c-ai)" : "var(--c-surface)") : "transparent", color: st.mode === m ? (m === "ai" ? "var(--c-on-ai)" : "var(--c-ink)") : "var(--c-ink-3)", boxShadow: st.mode === m && m === "paste" ? "var(--e1)" : "none" }}>
                      <Icon name={ic} size={14} />{l}</button>
                  ))}
                </div>
              </div>

              {st.mode === "ai" && !st.generated && !generating && (
                <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 15, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)" }}><Icon name="sparkles" size={26} /></div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Let <span style={{ color: "var(--c-ai-ink)" }}>jd-author</span> draft it for you</div>
                  <p style={{ margin: "6px auto 16px", maxWidth: 360, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>From the title and basics above, the agent writes the description, splits required vs nice-to-have, and self-audits for biased language.</p>
                  <button onClick={generate} disabled={!st.title.trim()} style={{ position: "relative", overflow: "hidden", display: "inline-flex", gap: 8, alignItems: "center", padding: "11px 20px", borderRadius: "var(--r)", border: "none",
                    background: "var(--c-ai)", color: "var(--c-on-ai)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: st.title.trim() ? "pointer" : "not-allowed", opacity: st.title.trim() ? 1 : 0.5, fontFamily: "var(--font-sans)" }}>
                    <span style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / .35) 50%, transparent 70%)", transform: "translateX(-100%)", animation: "shimmer 2.4s infinite" }} />
                    <Icon name="sparkles" size={16} /> Generate description
                  </button>
                  {genError && (
                    <div style={{ marginTop: 14, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", display: "inline-flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
                      <Icon name="flag" size={14} style={{ color: "var(--c-danger)", flexShrink: 0 }} /><span>jd-author could not draft this right now. Try again, or paste your own description.</span>
                    </div>
                  )}
                </div>
              )}

              {generating && (
                <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 24%, var(--c-line))", background: "var(--c-ai-tint)", padding: 20 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--c-ai)", animation: "pulse 1.3s infinite" }} />
                    <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>jd-author is writing...</span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>Drafting the description, splitting required vs nice-to-have, and running a bias self-audit.</p>
                </div>
              )}

              {(st.generated || st.mode === "paste") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "rise .35s var(--ease-out)" }}>
                  {st.generated && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
                      <Inclusivity score={st.inclusivity} />
                      <Btn variant="soft" size="sm" icon="sparkles" onClick={generate}>{generating ? "..." : "Regenerate"}</Btn>
                    </div>
                  )}
                  <Field label="Description">
                    <textarea value={st.description} onChange={(e) => set({ description: e.target.value })} rows={5} placeholder="Describe the role, the team, and the impact..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
                  </Field>
                  <Field label={st.generated ? "Required qualifications" : "Required skills"} hint="sent to the screener">
                    {st.generated
                      ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{st.required.map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 11px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", fontSize: 12.5 }}><Icon name="check" size={13} style={{ color: "var(--c-brand)" }} />{r}</div>
                        ))}</div>
                      : <Chips items={st.skills} setItems={(v) => set({ skills: v })} placeholder="Type a skill and press Enter" />}
                  </Field>
                  <Field label="Nice-to-have">
                    {st.generated
                      ? <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{st.niceToHave.map((r, i) => <Pill key={i} tone="var(--c-ink-2)" bg="var(--c-surface-2)">{r}</Pill>)}</div>
                      : <Chips items={st.niceToHave} setItems={(v) => set({ niceToHave: v })} placeholder="Optional skills..." tone="var(--c-ink-2)" bg="var(--c-surface-2)" />}
                  </Field>

                  {st.generated && biasFlags.length > 0 && (
                    <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} /> Bias self-audit</span>
                        <Pill tone={biasFlags.every((f) => f.applied) ? "var(--c-ok)" : "var(--c-warn)"} bg={biasFlags.every((f) => f.applied) ? "var(--c-ok-tint)" : "var(--c-warn-tint)"}>
                          {biasFlags.filter((f) => !f.applied).length} to review</Pill>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{biasFlags.map((f) => <BiasFlag key={f.id} f={f} onFix={fixBias} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* custom fields */}
            <section style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-ai) 28%, var(--c-line))", padding: 18, background: "linear-gradient(180deg, var(--c-ai-tint) 0%, transparent 40%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3></div>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--c-ink-2)", maxWidth: 480, lineHeight: 1.45 }}>Type any criterion that matters for this role. The <b style={{ color: "var(--c-ai-ink)" }}>label and value are sent to the AI screener</b> and become their own row in every candidate&apos;s verdict.</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 32px", gap: 9, padding: "10px 0 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
                <span>Label (you write this)</span><span>What good looks like</span><span>Importance</span><span></span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {st.customFields.map((cf) => <CFRow key={cf.id} cf={cf} onChange={updCF} onRemove={rmCF} />)}
              </div>
              <button onClick={addCF} style={{ marginTop: 11, display: "inline-flex", gap: 7, alignItems: "center", padding: "8px 13px", borderRadius: "var(--r)", border: "1px dashed color-mix(in oklab, var(--c-ai) 40%, var(--c-line))", background: "var(--c-surface)", color: "var(--c-ai-ink)", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <Icon name="plus" size={15} /> Add criterion
              </button>
            </section>

            {saveError && (
              <div style={{ padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
                <Icon name="flag" size={14} style={{ color: "var(--c-danger)", flexShrink: 0 }} /><span>We could not create this requisition. Check the details and try posting again.</span>
              </div>
            )}
          </div>

          {/* preview */}
          <div style={{ padding: "22px 22px 22px", display: "flex", flexDirection: "column" }}>
            <Preview st={st} />
          </div>
        </div>
      </div>
    </div>
  );
}
