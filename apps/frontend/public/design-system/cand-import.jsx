/* cand-import.jsx, bulk CSV import wizard + AI sourcing */
const { useState: uSimp, useEffect: uEimp } = React;
const CI = window.UI;

/* ---------------- Bulk import ---------------- */
const IMPORT_COLS = [
  { csv: "full_name", map: "Name", sample: "Hana Suzuki", ok: true },
  { csv: "email_address", map: "Email", sample: "hana@…", ok: true },
  { csv: "current_title", map: "Headline", sample: "Backend Engineer", ok: true },
  { csv: "location", map: "Location", sample: "Remote", ok: true },
  { csv: "source_channel", map: "Source", sample: "Referral", ok: true },
  { csv: "linkedin", map: "Links", sample: "linkedin.com/in/…", ok: true },
  { csv: "notes_internal", map: ", Skip, ", sample: "(ignored)", ok: false },
];
function ImportScreen({ onBack }) {
  const [step, setStep] = uSimp(1);
  const steps = ["Upload", "Map columns", "Preview", "Done"];
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}><Icon name="chevsL" size={14} /> Candidates</button>
        <h1 style={{ margin: "0 0 4px", fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Bulk import candidates</h1>
        <p style={{ margin: "0 0 22px", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Upload a CSV, map the columns, preview, and commit. The résumé-parser enriches each record on import.</p>

        {/* stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                  background: step > i+1 ? "var(--brand)" : step === i+1 ? "var(--brand-tint)" : "var(--surface-2)", color: step > i+1 ? "var(--on-brand)" : step === i+1 ? "var(--brand-ink)" : "var(--ink-3)", border: step === i+1 ? "1px solid var(--brand)" : "1px solid var(--line)" }}>
                  {step > i+1 ? <Icon name="check" size={14} stroke={3} /> : i+1}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: step >= i+1 ? "var(--ink)" : "var(--ink-3)" }}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{ flex: 1, height: 1, background: step > i+1 ? "var(--brand)" : "var(--line)", margin: "0 12px" }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 24, boxShadow: "var(--e1)" }}>
          {step === 1 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "100%", maxWidth: 460, margin: "0 auto", border: "1.5px dashed var(--line-strong)", borderRadius: "var(--r-xl)", padding: "36px 20px", background: "var(--surface-2)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--brand-tint)", color: "var(--brand)" }}><Icon name="users" size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop your CSV here</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "4px 0 14px" }}>or browse, up to 5,000 rows on your plan</div>
                <CI.Btn variant="soft" icon="fileText">Choose file</CI.Btn>
              </div>
              <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--ok-tint)", fontSize: 12.5, color: "var(--ink-2)" }}>
                <Icon name="check" size={15} style={{ color: "var(--ok)" }} /><b>candidates_may.csv</b> · 412 rows detected · 7 columns
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, padding: "0 0 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
                <span>CSV column</span><span></span><span>Maps to</span><span>Sample</span>
              </div>
              {IMPORT_COLS.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--ink)" }}>{c.csv}</span>
                  <Icon name="chevR" size={14} style={{ color: "var(--ink-3)" }} />
                  <select defaultValue={c.map} style={{ padding: "7px 9px", borderRadius: "var(--r-sm)", border: "1px solid", borderColor: c.ok ? "var(--line-2)" : "var(--line)", background: c.ok ? "var(--surface)" : "var(--surface-2)", color: c.ok ? "var(--ink)" : "var(--ink-3)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
                    <option>{c.map}</option><option>, Skip, </option><option>Name</option><option>Email</option><option>Source</option>
                  </select>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{c.sample}</span>
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <CI.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">409 valid</CI.Pill>
                <CI.Pill icon="flag" tone="var(--warn)" bg="var(--warn-tint)">3 missing email</CI.Pill>
                <CI.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">résumé-parser will enrich on import</CI.Pill>
              </div>
              <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 1fr", gap: 10, padding: "9px 13px", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-3)" }}>
                  <span>Name</span><span>Email</span><span>Headline</span><span>Source</span>
                </div>
                {[["Hana Suzuki","hana@hey.com","Backend Engineer","Referral"],["Owen Walsh","owen.w@mail.com","Sr. Engineer","LinkedIn"],["Leo Fontaine",", ","Security Eng","Inbound"],["Ben Carter","ben.c@mail.com","Marketer","Job board"]].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 1fr", gap: 10, padding: "9px 13px", borderTop: "1px solid var(--line)", fontSize: 12.5, background: r[1] === ", " ? "var(--warn-tint)" : "transparent" }}>
                    <span style={{ fontWeight: 600 }}>{r[0]}</span><span className="mono" style={{ color: r[1] === ", " ? "var(--warn)" : "var(--ink-2)" }}>{r[1]}</span><span style={{ color: "var(--ink-2)" }}>{r[2]}</span><span style={{ color: "var(--ink-2)" }}>{r[3]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--ok-tint)", color: "var(--ok)" }}><Icon name="check" size={32} stroke={2.2} /></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>409 candidates imported</h2>
              <p style={{ margin: "8px auto 0", maxWidth: 380, fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>The résumé-parser is enriching them now, scores will appear in the queue within a few minutes.</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <CI.Btn variant="ghost" onClick={() => step > 1 ? setStep(step-1) : onBack()}>{step > 1 ? "Back" : "Cancel"}</CI.Btn>
          {step < 4 ? <CI.Btn variant="primary" trailIcon="chevR" onClick={() => setStep(step+1)}>{step === 3 ? "Import 409 candidates" : "Continue"}</CI.Btn>
            : <CI.Btn variant="primary" icon="users" onClick={onBack}>View candidates</CI.Btn>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- AI sourcing ---------------- */
const SOURCING_RESULTS = [
  { id: "s1", ini: "EM", name: "Elena Marshall", role: "Staff Backend Engineer @ Stripe-like", match: 0.92, loc: "Austin, TX", source: "Internal DB", skills: ["Go", "Kafka", "Payments"], why: "Direct payments infra experience and Go depth, closely matches the must-have fintech domain criterion." },
  { id: "s2", ini: "RK", name: "Raj Kapoor", role: "Senior SWE @ Fintech", match: 0.87, loc: "Remote", source: "LinkedIn", skills: ["Rust", "Distributed", "gRPC"], why: "Regulated money-movement background; strong systems signal, lighter on team size." },
  { id: "s3", ini: "NW", name: "Nadia West", role: "Backend Lead @ Marketplace", match: 0.81, loc: "Denver, CO", source: "Internal DB", skills: ["Go", "Postgres", "Leadership"], why: "Leads a 6-person pod, covers the leadership gap, adjacent (not core) fintech." },
  { id: "s4", ini: "JP", name: "Julian Park", role: "Platform Engineer @ Bank", match: 0.78, loc: "Remote", source: "Job board", skills: ["Go", "Kubernetes", "Compliance"], why: "Banking compliance exposure; would need a systems-design deep dive." },
];
function SourcingScreen({ onBack }) {
  const [searched, setSearched] = uSimp(false);
  const [loading, setLoading] = uSimp(false);
  const [shortlist, setShortlist] = uSimp(new Set());
  const run = () => { setLoading(true); setSearched(false); };
  uEimp(() => { if (loading) { const t = setTimeout(() => { setLoading(false); setSearched(true); }, 1400); return () => clearTimeout(t); } }, [loading]);
  const toggle = (id) => { const n = new Set(shortlist); n.has(id) ? n.delete(id) : n.add(id); setShortlist(n); };

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}><Icon name="chevsL" size={14} /> Candidates</button>
        <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>AI sourcing</h1>
          <CI.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">sourcing agent</CI.Pill>
        </div>
        <p style={{ margin: "0 0 18px", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Describe who you're looking for. The agent searches your internal pool and connected boards, then ranks matches with rationale.</p>

        {/* query */}
        <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line-2)", background: "var(--surface)" }}>
            <Icon name="radar" size={18} style={{ color: "var(--ai)" }} />
            <input defaultValue="Senior backend engineer, Go + payments, 5+ yrs, US time zones" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
            <CI.Btn variant="ai" icon="sparkles" onClick={run}>Search with AI</CI.Btn>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {["For REQ-4821", "Internal DB + LinkedIn", "Exclude in-pipeline", "Min match 0.7"].map(f => <CI.Pill key={f} icon="dot" tone="var(--ink-2)">{f}</CI.Pill>)}
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ai)", animation: "pulsering 1.3s infinite" }} />
            <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>Searching internal pool & LinkedIn · semantic + keyword passes · verifying profiles…</span>
          </div>
        )}

        {searched && (
          <div style={{ animation: "rise .35s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{SOURCING_RESULTS.length} strong matches <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· scanned 1,840 profiles</span></span>
              {shortlist.size > 0 && <CI.Btn variant="primary" size="sm" icon="plus">Add {shortlist.size} to REQ-4821</CI.Btn>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {SOURCING_RESULTS.map(r => {
                const on = shortlist.has(r.id);
                return (
                  <div key={r.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: 16, borderRadius: "var(--r-lg)", border: "1px solid", borderColor: on ? "var(--brand)" : "var(--line)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
                    <CI.ScoreRing value={Math.round(r.match * 100)} size={52} band="var(--ai)" label="match" />
                    <span className="mono" style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white" }}>{r.ini}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{r.name}</span>
                        <CI.Pill icon="dot" tone="var(--ink-2)">{r.source}</CI.Pill>
                        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r.loc}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", margin: "2px 0 6px" }}>{r.role}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <Icon name="sparkles" size={13} style={{ color: "var(--ai)", flexShrink: 0, marginTop: 2 }} />
                        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45 }}>{r.why}</p>
                      </div>
                    </div>
                    <button onClick={() => toggle(r.id)} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "8px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: on ? "transparent" : "var(--line-2)", background: on ? "var(--brand)" : "var(--surface)", color: on ? "var(--on-brand)" : "var(--ink)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>
                      <Icon name={on ? "check" : "plus"} size={14} />{on ? "Shortlisted" : "Shortlist"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ImportScreen, SourcingScreen });
