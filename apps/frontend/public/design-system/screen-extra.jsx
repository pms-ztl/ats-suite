/* screen-extra.jsx, Team, Integrations (route into Settings), Support, Audit Log */
const { useState: uSx } = React;
const EX = window.UI;

window.AUDIT_LOG = [
  { actor: "candidate-screener", ai: true, action: "Scored candidate", target: "Priya Raman · Sr. Backend Engineer", cat: "ai", t: "10:42:18" },
  { actor: "Avery Chen", ini: "AC", action: "Advanced candidate to Interview", target: "Dana Osei", cat: "decision", t: "10:39:51" },
  { actor: "Marcus Bell", ini: "MB", action: "Edited requisition", target: "Platform Engineer", cat: "config", t: "10:31:07" },
  { actor: "bias-auditor", ai: true, action: "Flagged adverse impact", target: "Design reqs · ratio 0.69", cat: "ai", t: "10:18:44" },
  { actor: "Avery Chen", ini: "AC", action: "Rejected candidate", target: "Jordan Lee · reason: skills", cat: "decision", t: "09:58:22" },
  { actor: "Sofia Nguyen", ini: "SN", action: "Signed in via SSO", target: "acme.com SAML", cat: "access", t: "09:51:10" },
  { actor: "jd-author", ai: true, action: "Generated job description", target: "Staff Product Designer", cat: "ai", t: "09:44:33" },
  { actor: "Avery Chen", ini: "AC", action: "Exported EEOC report", target: "Q2 2026 · diversity", cat: "data", t: "09:30:05" },
  { actor: "Marcus Bell", ini: "MB", action: "Invited teammate", target: "lena@northwind.co · Recruiter", cat: "config", t: "Yesterday" },
  { actor: "offer-agent", ai: true, action: "Drafted offer letter", target: "Dana Osei · Platform Engineer", cat: "ai", t: "Yesterday" },
  { actor: "Sofia Nguyen", ini: "SN", action: "Approved offer", target: "Dana Osei · $185k base", cat: "decision", t: "Yesterday" },
  { actor: "System", ini: "SY", action: "Purged expired résumé files", target: "14 files · retention policy", cat: "data", t: "2 days ago" },
  { actor: "Avery Chen", ini: "AC", action: "Changed data-retention policy", target: "Candidate data → 24 months", cat: "config", t: "2 days ago" },
  { actor: "Priya Sharma", ini: "PS", action: "Downloaded candidate data", target: "Backend Engineer pool", cat: "data", t: "3 days ago" },
];

/* Team & Integrations reuse the Settings two-panel, pre-selecting their panel */
function TeamScreen() { return <window.SettingsScreen initial="team" />; }
function IntegrationsScreen() { return <window.SettingsScreen initial="integrations" />; }

/* ---------------- Support ---------------- */
function SupportScreen() {
  const [topic, setTopic] = uSx("Technical issue");
  const [sent, setSent] = uSx(false);
  const [openFaq, setOpenFaq] = uSx(0);
  const cards = [
    ["mail", "var(--brand)", "var(--brand-tint)", "Submit a ticket", "Get help from our team. Most replies within 4 hours."],
    ["book", "var(--info)", "var(--info-tint)", "Browse the docs", "Guides, API reference, and best practices."],
    ["sparkles", "var(--ai)", "var(--ai-tint)", "Ask Copilot", "Instant answers from your in-product assistant."],
  ];
  const tickets = [
    ["var(--ok)", "#4821 · SSO metadata question", "Resolved · 2d ago"],
    ["var(--warn)", "#4830 · Bulk import column mapping", "Awaiting your reply · 5h ago"],
    ["var(--info)", "#4835 · Feature request: Lever import", "Triaged · 1d ago"],
  ];
  const faqs = [
    ["How do I add more seats?", "Go to Billing → Add seats, or upgrade your plan. New seats are prorated for the current period."],
    ["Why was a candidate flagged for review?", "When the screener's confidence falls below the 0.70 threshold, the verdict is held for a human decision rather than auto-advanced."],
    ["Can I export our hiring data?", "Yes. Analytics and Compliance both offer CSV and EEOC-formatted exports. API access is available on Professional and above."],
    ["How is AI used in screening?", "AI scores candidates against your requirements and shows its evidence, but it is advisory only. A human always makes the final decision."],
  ];
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "30px 32px 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <window.Greeting title="How can we help?" sub="Search the docs, ask Copilot, or open a ticket. We're here." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
          {cards.map((c, i) => (
            <window.Reveal key={i} i={i}>
              <button style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", padding: 18, boxShadow: "var(--e1)", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--e2)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: c[2], color: c[1], marginBottom: 12 }}><Icon name={c[0]} size={21} /></span>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{c[3]}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", marginTop: 3, lineHeight: 1.45 }}>{c[4]}</div>
              </button>
            </window.Reveal>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
          <window.Reveal i={3}><window.SectionCard title="Submit a ticket" icon="mail">
            {sent ? (
              <div style={{ textAlign: "center", padding: "26px 10px" }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--ok-tint)", color: "var(--ok)", margin: "0 auto 14px" }}><Icon name="check" size={26} stroke={2.4} /></span>
                <div style={{ fontWeight: 800, fontSize: "var(--fs-lg)" }}>Ticket submitted</div>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", margin: "5px 0 16px" }}>We'll reply to avery@northwind.co within 4 hours.</p>
                <EX.Btn variant="soft" onClick={() => setSent(false)}>Submit another</EX.Btn>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <label style={{ display: "block" }}><div style={fieldLbl}>Topic</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {["Technical issue", "Billing", "Feature request", "Other"].map(t => (
                      <button key={t} onClick={() => setTopic(t)} style={{ padding: "7px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)",
                        border: "1px solid", borderColor: topic === t ? "transparent" : "var(--line-2)", background: topic === t ? "var(--brand-tint)" : "var(--surface)", color: topic === t ? "var(--brand-ink)" : "var(--ink-2)" }}>{t}</button>
                    ))}
                  </div>
                </label>
                <label style={{ display: "block" }}><div style={fieldLbl}>Subject</div>
                  <input placeholder="Brief summary" style={inpX} /></label>
                <label style={{ display: "block" }}><div style={fieldLbl}>Details</div>
                  <textarea rows={4} placeholder="What's happening? Steps to reproduce help us help you faster." style={{ ...inpX, resize: "vertical", lineHeight: 1.5 }} /></label>
                <EX.Btn variant="primary" icon="mail" onClick={() => setSent(true)} style={{ justifyContent: "center" }}>Submit ticket</EX.Btn>
              </div>
            )}
          </window.SectionCard></window.Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <window.Reveal i={4}><window.SectionCard title="Your tickets" icon="lifebuoy" action="View all" pad={6}>
              {tickets.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 12px", borderRadius: "var(--r)", transition: "background var(--t-fast)", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: t[0], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t[1]}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{t[2]}</div></div>
                  <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />
                </div>
              ))}
            </window.SectionCard></window.Reveal>

            <window.Reveal i={5}><window.SectionCard title="Popular FAQs" icon="book" pad={6}>
              {faqs.map((f, i) => (
                <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "12px 8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{f[0]}</span>
                    <Icon name="chevD" size={17} style={{ color: "var(--ink-3)", flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
                  </button>
                  {openFaq === i && <div style={{ padding: "0 8px 13px", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{f[1]}</div>}
                </div>
              ))}
            </window.SectionCard></window.Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Audit Log ---------------- */
function AuditScreen() {
  const [q, setQ] = uSx("");
  const [filter, setFilter] = uSx("all");
  const rows = window.AUDIT_LOG || [];
  const filtered = rows.filter(r =>
    (filter === "all" || (filter === "ai" ? r.ai : filter === "human" ? !r.ai : r.cat === filter)) &&
    (!q || (r.actor + " " + r.action + " " + r.target).toLowerCase().includes(q.toLowerCase()))
  );
  const catColor = { access: ["var(--info)", "var(--info-tint)"], data: ["var(--brand)", "var(--brand-tint)"], decision: ["var(--warn)", "var(--warn-tint)"], config: ["var(--ink-2)", "var(--surface-2)"], ai: ["var(--ai)", "var(--ai-tint)"] };
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <window.Greeting title="Audit log" sub="A complete, tamper-evident record of every action in this workspace.">
          <EX.Pill icon="shield" tone="var(--ok)" bg="var(--ok-tint)">7-year retention</EX.Pill>
          <EX.Btn variant="primary" icon="arrowUpRight">Export CSV</EX.Btn>
        </window.Greeting>

        {/* controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "1 1 240px", maxWidth: 360, height: 38, padding: "0 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)" }}>
            <Icon name="search" size={16} style={{ color: "var(--ink-3)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search actor, action, or target…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[["all", "All"], ["human", "Human"], ["ai", "AI agents"], ["access", "Access"], ["decision", "Decisions"], ["config", "Config"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: "7px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                border: "1px solid", borderColor: filter === k ? "transparent" : "var(--line-2)", background: filter === k ? "var(--brand-tint)" : "var(--surface)", color: filter === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* table */}
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--surface)", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "11px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <span>Actor</span><span>Action</span><span>Category</span><span style={{ textAlign: "right" }}>Timestamp</span>
          </div>
          <div style={{ maxHeight: "calc(100vh - 290px)", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>No audit entries match your filter.</div>
            ) : filtered.map((r, i) => {
              const [cc, cb] = catColor[r.cat] || catColor.config;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "12px 18px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", transition: "background var(--t-fast)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, background: r.ai ? "var(--ai-tint)" : "var(--surface-3)", color: r.ai ? "var(--ai)" : "var(--ink-2)" }} className="mono">{r.ai ? <Icon name="sparkles" size={13} /> : r.ini}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: r.ai ? "var(--ai-ink)" : "var(--ink)" }} className={r.ai ? "mono" : ""}>{r.actor}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", minWidth: 0 }}>
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>{r.action}</span>{r.target ? <span style={{ color: "var(--ink-3)" }}> · {r.target}</span> : null}
                  </div>
                  <span><EX.Pill tone={cc} bg={cb} style={{ fontSize: 10 }}>{r.cat}</EX.Pill></span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "right" }}>{r.t}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--ink-3)", display: "flex", gap: 7, alignItems: "center" }}>
          <Icon name="shield" size={14} style={{ color: "var(--ok)" }} /> Entries are write-once and cryptographically chained. Showing {filtered.length} of {rows.length}.
        </div>
      </div>
    </div>
  );
}

const fieldLbl = { fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 };
const inpX = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

Object.assign(window, { TeamScreen, IntegrationsScreen, SupportScreen, AuditScreen });
