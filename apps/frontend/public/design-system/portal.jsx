/* portal.jsx, Northwind Talent candidate portal (warm, ethical-AI-first) */
const { useState, useEffect } = React;

/* ---- icons (subset) ---- */
const PI = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  check: "M5 12.5l4.5 4.5L19 7.5", x: "M6 6l12 12M18 6 6 18", arrow: "M5 12h14M13 6l6 6-6 6",
  chevR: "M9 6l6 6-6 6", chevL: "M15 6l-6 6 6 6", sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  file: "M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5", eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  heart: "M12 20s-7-4.5-9.2-9C1.4 8.2 2.6 5 5.6 5c1.9 0 3.1 1.2 3.9 2.3C10.3 6.2 11.5 5 13.4 5c3 0 4.2 3.2 2.8 6-2.2 4.5-9.2 9-9.2 9z",
  upload: "M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3", briefcase: "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  dot: "M12 12h.01", scale: "M12 3v18M7 7l-4 7a4 4 0 0 0 8 0zM17 7l-4 7a4 4 0 0 0 8 0zM5 21h14",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z",
  fileText: "M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M8 13h8M8 17h5",
  arrowUp: "M12 19V5M5 12l7-7 7 7", mail: "M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
};
function I({ n, s = 20, sw = 1.7, c, style }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true"><path d={PI[n]} /></svg>; }
function Logo({ s = 30 }) { return <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" /><path d="M8.5 23.5L16 7l7.5 16.5" stroke="var(--on-brand)" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16.5h8" stroke="var(--on-brand)" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="6.2" r="2.2" fill="#9b8cff"/></svg>; }

/* ---- data ---- */
const TENANT = { name: "Northwind Talent", tagline: "Build the future of payments." };
const JOBS = [
  { id: "j1", title: "Senior Backend Engineer", dept: "Payments", loc: "Austin, TX · Remote (US)", type: "Full-time", min: 160, max: 200, fresh: true, blurb: "Design and scale the core services behind a platform that moves billions of dollars a year." },
  { id: "j2", title: "Staff Product Designer", dept: "Design", loc: "New York, NY", type: "Full-time", min: 170, max: 215, blurb: "Shape the end-to-end experience of our hiring products, from first sketch to shipped." },
  { id: "j3", title: "Platform Engineer", dept: "Infrastructure", loc: "Remote · US", type: "Full-time", min: 150, max: 190, blurb: "Own the infrastructure that keeps our agents fast, reliable, and observable." },
  { id: "j4", title: "Growth Marketing Lead", dept: "Marketing", loc: "Austin, TX", type: "Full-time", min: 130, max: 165, blurb: "Build the growth engine that brings the best teams to CDC ATS." },
  { id: "j5", title: "Security Engineer", dept: "Security", loc: "Remote · US", type: "Full-time", min: 165, max: 205, blurb: "Keep candidate data safe with defense-in-depth across our platform." },
  { id: "j6", title: "Data Engineer", dept: "Data", loc: "Remote · US", type: "Full-time", min: 145, max: 180, blurb: "Turn hiring signals into the metrics that drive fair, fast decisions." },
];
const JOB_DETAIL = {
  required: ["5+ years building backend services in production", "Strong in Go, Rust, or a comparable systems language", "Experience with distributed systems and event-driven architectures", "Track record owning services from design through on-call"],
  nice: ["Payments, fintech, or regulated money movement", "Familiarity with Kafka or streaming platforms"],
  custom: [{ label: "Must have fintech domain experience", help: "Tell us about regulated money movement, payments, or banking work." }, { label: "Time-zone overlap", help: "Do you have ≥ 4 hours overlap with US Central?" }],
};
const STATUS_STAGES = [
  { k: "Applied", done: true, date: "May 24" },
  { k: "Under review", done: true, current: true, date: "In progress" },
  { k: "Interview", done: false },
  { k: "Decision", done: false },
];
/* candidate account (portal home / profile) */
const ME = { name: "Jordan Avery", email: "jordan.avery@hey.com", phone: "+1 (512) 555-0148", loc: "Austin, TX", initials: "JA",
  resume: { file: "Jordan-Avery-Resume.pdf", size: "284 KB", updated: "May 24, 2026" } };
const MY_APPS = [
  { id: "a1", title: "Senior Backend Engineer", co: "Northwind Talent", applied: "May 24", stage: "Under review", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock", step: 1 },
  { id: "a2", title: "Platform Engineer", co: "Helios Robotics", applied: "May 12", stage: "Interview", tone: "var(--info)", bg: "var(--info-tint)", icon: "calendar", step: 2 },
  { id: "a3", title: "Backend Engineer", co: "Atlas Health", applied: "Apr 28", stage: "Not selected", tone: "var(--ink-3)", bg: "var(--surface-2)", icon: "dot", step: 0 },
];
const MY_INTERVIEW = { role: "Platform Engineer", co: "Helios Robotics", when: "Tue, Jun 3 · 2:00 PM CT", dur: "45 min", mode: "Video call", panel: ["Sam Rivera", "Dana Osei"] };

/* ---- shared ---- */
function Btn({ kind = "primary", icon, trail, children, onClick, big, full, style = {} }) {
  const V = {
    primary: { background: "var(--brand)", color: "var(--on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line-2)" },
    ghost: { background: "transparent", color: "var(--ink-2)" },
    ai: { background: "var(--ai)", color: "var(--on-brand)" },
  }[kind];
  return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)", fontWeight: 700, borderRadius: "var(--r)", cursor: "pointer", border: "1px solid transparent", width: full ? "100%" : "auto", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", ...V, ...style }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
    {icon && <I n={icon} s={big ? 19 : 17} />}{children}{trail && <I n={trail} s={big ? 19 : 17} />}</button>;
}
function Chip({ icon, children, tone = "var(--ink-2)", bg = "var(--surface-2)" }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg }}>{icon && <I n={icon} s={13} />}{children}</span>;
}
/* AI-assistive banner, appears wherever AI touches the candidate */
function AINotice({ compact }) {
  return <div style={{ display: "flex", gap: 12, alignItems: compact ? "center" : "flex-start", padding: compact ? "11px 14px" : "16px 18px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
    <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ai)", color: "var(--on-brand)", display: "grid", placeItems: "center", flexShrink: 0 }}><I n="sparkles" s={17} /></span>
    <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>AI is assistive, a human decides.</div>
      {!compact && <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>We use AI to help our team review applications fairly. It produces a recommendation only, a person always makes the final call, and you can ask for a human review at any time.</p>}</div>
  </div>;
}

/* ---- shell ---- */
function Nav({ go, page }) {
  return <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(14px) saturate(160%)", WebkitBackdropFilter: "blur(14px) saturate(160%)", background: "oklch(0.99 0.006 76 / 0.78)", borderBottom: "1px solid var(--line)" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => go("jobs")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}><Logo s={30} /><div style={{ textAlign: "left" }}><div style={{ fontWeight: 800, fontSize: "var(--fs-md)", letterSpacing: "-0.02em" }}>{TENANT.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: -2 }}>Careers</div></div></button>
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[["jobs", "Open roles"], ["status", "Check status"], ["transparency", "How we use AI"], ["profile", "My account"]].map(([k, l]) => (
          <button key={k} onClick={() => go(k)} style={{ padding: "8px 14px", borderRadius: "var(--r-pill)", border: "none", background: page === k ? "var(--brand-tint)" : "transparent", color: page === k ? "var(--brand-ink)" : "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", cursor: "pointer" }}>{l}</button>
        ))}
        <a href="CDC ATS - System & Shell.html" style={{ marginLeft: 6, padding: "8px 16px", borderRadius: "var(--r-pill)", background: "var(--brand)", color: "var(--on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", textDecoration: "none" }}>Employer sign in</a>
      </nav>
    </div>
  </header>;
}
function Footer() {
  return <footer style={{ borderTop: "1px solid var(--line)", marginTop: 40, background: "var(--surface)" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Logo s={26} /><span style={{ fontWeight: 700 }}>{TENANT.name}</span>
      <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: "var(--fs-sm)", color: "var(--ai-ink)", fontWeight: 600 }}><I n="sparkles" s={14} /> AI is assistive, a human decides.</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>Equal-opportunity employer · Powered by CDC ATS</span>
    </div>
  </footer>;
}

/* ---- pages ---- */
function JobBoard({ go }) {
  const [q, setQ] = useState("");
  const list = JOBS.filter(j => !q || (j.title + j.dept + j.loc).toLowerCase().includes(q.toLowerCase()));
  return <div style={{ animation: "rise .4s var(--ease-out)" }}>
    {/* hero */}
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 32px", textAlign: "center" }}>
      <Chip icon="heart" tone="var(--brand)" bg="var(--brand-tint)">We're hiring · 6 open roles</Chip>
      <h1 style={{ fontSize: "var(--fs-4xl)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "18px 0 0", textWrap: "balance" }}>{TENANT.tagline}</h1>
      <p style={{ fontSize: "var(--fs-lg)", color: "var(--ink-2)", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.5 }}>Join a team building hiring tools that are fast, fair, and a genuine pleasure to use. Every application gets a human's attention.</p>
      <div style={{ maxWidth: 460, margin: "26px auto 0", display: "flex", gap: 10, alignItems: "center", padding: "7px 7px 7px 16px", borderRadius: "var(--r-pill)", background: "var(--surface)", border: "1px solid var(--line-2)", boxShadow: "var(--e2)" }}>
        <I n="search" s={19} c="var(--ink-3)" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search roles, teams, locations…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--ink)" }} />
        <Btn kind="primary">Search</Btn>
      </div>
    </div>
    {/* jobs */}
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 24px 20px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {list.map((j, i) => (
        <button key={j.id} onClick={() => go("apply", j)} style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "var(--surface)", borderRadius: "var(--r-xl)", padding: 22, boxShadow: "var(--e1)", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", animation: "rise .4s var(--ease-out) both", animationDelay: (i * 50) + "ms" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--e2)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}><Chip icon="briefcase">{j.dept}</Chip>{j.fresh && <Chip tone="var(--brand)" bg="var(--brand-tint)">New</Chip>}</div>
            <I n="arrow" s={18} c="var(--ink-3)" />
          </div>
          <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 6px" }}>{j.title}</h3>
          <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>{j.blurb}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}><Chip icon="pin">{j.loc}</Chip><Chip icon="card" tone="var(--brand)" bg="var(--brand-tint)">${j.min}k to ${j.max}k</Chip></div>
        </button>
      ))}
    </div>
  </div>;
}

function Apply({ job, go }) {
  const [done, setDone] = useState(false);
  if (done) return <Confirm job={job} go={go} />;
  const inp = { width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" };
  const Label = ({ children, req }) => <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink-2)", marginBottom: 7 }}>{children}{req && <span style={{ color: "var(--brand)" }}> *</span>}</label>;
  return <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
    <button onClick={() => go("jobs")} style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</button>
    {/* job header */}
    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}><Chip icon="briefcase">{job.dept}</Chip><Chip icon="pin">{job.loc}</Chip><Chip icon="card" tone="var(--brand)" bg="var(--brand-tint)">${job.min}k to ${job.max}k</Chip></div>
    <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>{job.title}</h1>
    <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 18px" }}>{job.blurb} You'll own services end to end and grow with a team that values clarity and craft.</p>
    <div style={{ marginBottom: 22 }}><div style={{ fontWeight: 700, marginBottom: 9 }}>What you'll need</div><div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{JOB_DETAIL.required.map((r, i) => <div key={i} style={{ display: "flex", gap: 9, fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}><I n="check" s={17} c="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />{r}</div>)}</div></div>

    <AINotice />

    {/* form */}
    <form onSubmit={e => { e.preventDefault(); setDone(true); }} style={{ marginTop: 20 }}>
      <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26 }}>
        <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 18px" }}>Apply for this role</h2>
        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}><div style={{ flex: 1 }}><Label req>Full name</Label><input required style={inp} placeholder="Your name" /></div><div style={{ flex: 1 }}><Label req>Email</Label><input required type="email" style={inp} placeholder="you@email.com" /></div></div>
        <div style={{ marginBottom: 16 }}><Label>LinkedIn or portfolio</Label><input style={inp} placeholder="https://" /></div>
        {/* résumé upload */}
        <div style={{ marginBottom: 20 }}><Label req>Résumé / CV</Label>
          <div style={{ border: "1.5px dashed var(--line-strong)", borderRadius: "var(--r-lg)", padding: "22px", textAlign: "center", background: "var(--surface-2)", cursor: "pointer" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="upload" s={20} /></span>
            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>Drop your résumé or <span style={{ color: "var(--brand)" }}>browse</span></div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)", marginTop: 3 }}>PDF, DOCX · up to 10 MB</div>
          </div>
        </div>

        {/* custom fields from the requisition */}
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--brand-tint)", marginBottom: 18 }}>
          <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--brand-ink)", marginBottom: 12 }}>A few role-specific questions</div>
          {JOB_DETAIL.custom.map((c, i) => (
            <div key={i} style={{ marginBottom: i < JOB_DETAIL.custom.length - 1 ? 14 : 0 }}>
              <Label req>{c.label}</Label>
              <textarea rows={2} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} placeholder={c.help} />
            </div>
          ))}
        </div>
        <Label>Why are you interested in this role?</Label>
        <textarea rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.5, marginBottom: 18 }} placeholder="Optional, tell us what draws you here." />

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginBottom: 18, cursor: "pointer" }}>
          <input type="checkbox" required style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--brand)" }} />
          <span>I understand my application may be reviewed with the help of AI, that a human makes the final decision, and that I can <b style={{ color: "var(--ink)" }}>request a human review</b> at any time.</span>
        </label>
        <Btn kind="primary" big full trail="arrow">Submit application</Btn>
      </div>
    </form>
  </div>;
}

function Confirm({ job, go }) {
  return <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
    <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n="check" s={42} sw={2.2} /></div>
    <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Application received 🎉</h1>
    <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>Thanks for applying to <b style={{ color: "var(--ink)" }}>{job.title}</b>. We've emailed you a confirmation, you can check your status anytime.</p>
    <div style={{ margin: "22px auto 0", maxWidth: 420 }}><AINotice compact /></div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}><Btn kind="primary" icon="eye" onClick={() => go("status")}>Track my status</Btn><Btn kind="soft" onClick={() => go("jobs")}>Browse more roles</Btn></div>
  </div>;
}

function Status({ go }) {
  const [found, setFound] = useState(false);
  return <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
    <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px", textAlign: "center" }}>Check your application status</h1>
    <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", textAlign: "center", margin: "0 0 24px" }}>Enter the email you applied with, we'll show you exactly where things stand.</p>
    {!found ? (
      <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 24, maxWidth: 460, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10 }}><input defaultValue="priya.raman@hey.com" style={{ flex: 1, padding: "12px 15px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", fontSize: "var(--fs-md)", outline: "none" }} placeholder="you@email.com" /><Btn kind="primary" onClick={() => setFound(true)}>Look up</Btn></div>
      </div>
    ) : (
      <div style={{ animation: "rise .35s var(--ease-out)" }}>
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
            <div><div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Senior Backend Engineer</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>Applied May 24 · Northwind Talent</div></div>
            <Chip icon="clock" tone="var(--warn)" bg="var(--warn-tint)">Under review</Chip>
          </div>
          {/* tracker */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {STATUS_STAGES.map((s, i) => (
              <React.Fragment key={s.k}>
                <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 99, margin: "0 auto", display: "grid", placeItems: "center", background: s.done ? "var(--brand)" : "var(--surface-2)", color: s.done ? "var(--on-brand)" : "var(--ink-3)", border: s.current ? "2px solid var(--brand)" : s.done ? "none" : "1px solid var(--line)", boxShadow: s.current ? "0 0 0 4px var(--brand-tint)" : "none" }}>{s.done ? <I n="check" s={18} sw={2.4} /> : i + 1}</div>
                  <div style={{ fontSize: "var(--fs-sm)", fontWeight: s.current ? 700 : 500, color: s.done ? "var(--ink)" : "var(--ink-3)", marginTop: 8 }}>{s.k}</div>
                  {s.date && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{s.date}</div>}
                </div>
                {i < STATUS_STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: s.done ? "var(--brand)" : "var(--line)", marginTop: 17 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--line)", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>What's happening now</div>
          <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>A recruiter on the Northwind team is reviewing your application alongside an AI-assisted summary. You'll hear from us within about a week. No action is needed from you right now.</p>
        </div>
        <AINotice />
        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn kind="soft" icon="eye" onClick={() => go("transparency")}>See how AI was used</Btn>
          <Btn kind="ai" icon="users" onClick={() => go("appeal")}>Request human review</Btn>
        </div>
      </div>
    )}
  </div>;
}

function Transparency({ go }) {
  const assessed = ["Your skills and experience against the role's requirements", "Relevant projects and measurable impact", "Strengths and areas to explore in interviews"];
  const never = ["Your name, photo, age, gender, race, or any protected characteristic", "Where you went to school as a ranking factor", "Anything you didn't choose to share"];
  return <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--ai-tint)", color: "var(--ai)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><I n="sparkles" s={28} /></span>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>How we use AI in hiring</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>We believe AI should make hiring fairer and faster, never less human. Here's exactly how it works, in plain language.</p>
    </div>
    <div style={{ marginBottom: 18 }}><AINotice /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
      {[["What the AI looks at", assessed, "check", "var(--ok)"], ["What it never sees", never, "x", "var(--brand)"]].map(([t, arr, ic, col]) => (
        <div key={t} className="clay" style={{ borderRadius: "var(--r-xl)", padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 12 }}>{t}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{arr.map(x => <div key={x} style={{ display: "flex", gap: 9, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.45 }}><I n={ic} s={17} c={col} style={{ flexShrink: 0, marginTop: 1 }} />{x}</div>)}</div>
        </div>
      ))}
    </div>
    <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 22, marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 14 }}>How a decision gets made</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[["You apply", "Your résumé and answers come straight to our team."], ["AI assists", "An assistant compares your experience to the role and writes a recommendation, with its reasoning shown."], ["A human reviews", "A recruiter reads your application and the AI's notes, and makes the call."], ["You can appeal", "If you think something was missed, you can ask a person to take another look."]].map(([t, d], i, arr) => (
          <div key={i} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 30, height: 30, borderRadius: 99, background: i === 2 ? "var(--brand)" : "var(--brand-tint)", color: i === 2 ? "var(--on-brand)" : "var(--brand)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>{i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", minHeight: 14 }} />}</div>
            <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{t}</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 1 }}>{d}</div></div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ textAlign: "center" }}><Btn kind="ai" big icon="users" onClick={() => go("appeal")}>Request a human review</Btn></div>
  </div>;
}

function Appeal({ go }) {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState("");
  if (sent) return <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
    <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n="check" s={42} sw={2.2} /></div>
    <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Your request is with a person.</h1>
    <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>A member of the Northwind team will personally review your application and reply by email within 5 business days. Thank you.</p>
    <div style={{ marginTop: 24 }}><Btn kind="soft" onClick={() => go("status")}>Back to my status</Btn></div>
  </div>;
  return <div style={{ maxWidth: 600, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
    <button onClick={() => go("status")} style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> Back</button>
    <span style={{ width: 52, height: 52, borderRadius: 15, background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center", marginBottom: 14 }}><I n="users" s={26} /></span>
    <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Request a human review</h1>
    <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 20px" }}>This goes straight to a person on the Northwind hiring team with the authority to change the decision, no algorithms involved. Tell them what you'd like reconsidered.</p>
    <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 24 }}>
      <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>What should we take another look at?</label>
      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={5} style={{ width: "100%", padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--line-2)", background: "var(--surface)", fontSize: "var(--fs-md)", lineHeight: 1.55, resize: "vertical", outline: "none", fontFamily: "var(--font-sans)" }} placeholder="For example: my payments work at Lyra was core financial infrastructure handling regulated money movement…" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 18px" }}>{["Skills were under-counted", "Relevant experience missed", "Wrong role match", "Something else"].map(t => <button key={t} onClick={() => setReason(r => r || t)} style={{ fontSize: "var(--fs-xs)", fontWeight: 600, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", cursor: "pointer" }}>{t}</button>)}</div>
      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)", marginRight: "auto", display: "inline-flex", gap: 6, alignItems: "center" }}><I n="shield" s={14} /> A human reviews every appeal within 5 business days.</span>
        <Btn kind="ghost" onClick={() => go("status")}>Cancel</Btn>
        <Btn kind="primary" trail="arrow" onClick={() => setSent(true)}>Submit appeal</Btn>
      </div>
    </div>
  </div>;
}

function Profile({ go }) {
  return <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
    {/* greeting */}
    <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 26, flexWrap: "wrap" }}>
      <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22 }}>{ME.initials}</span>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Hi, {ME.name.split(" ")[0]}.</h1>
        <p style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)", margin: "4px 0 0" }}>Your applications, résumé, and upcoming interviews, all in one place.</p>
      </div>
      <div style={{ flex: 1 }} />
      <Btn kind="soft" icon="search" onClick={() => go("jobs")}>Browse roles</Btn>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
      {/* left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        {/* applications */}
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>My applications</h2>
            <Chip icon="briefcase">{MY_APPS.length} total</Chip>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MY_APPS.map(a => (
              <button key={a.id} onClick={() => go("status")} style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "var(--surface)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", gap: 13, alignItems: "center", transition: "transform .15s var(--ease-out), box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--e2)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <span style={{ width: 40, height: 40, borderRadius: "var(--r)", flexShrink: 0, background: a.bg, color: a.tone, display: "grid", placeItems: "center" }}><I n={a.icon} s={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>{a.co} · Applied {a.applied}</div>
                </div>
                <Chip icon={a.icon} tone={a.tone} bg={a.bg}>{a.stage}</Chip>
              </button>
            ))}
          </div>
        </div>

        {/* upcoming interview */}
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
          <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px" }}>Upcoming interview</h2>
          <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{MY_INTERVIEW.role}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>{MY_INTERVIEW.co}</div>
              </div>
              <Chip icon="calendar" tone="var(--brand-ink)" bg="var(--brand-tint)">Confirmed</Chip>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "14px 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><I n="clock" s={15} c="var(--ink-3)" /> {MY_INTERVIEW.when}</span>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><I n="dot" s={15} c="var(--ink-3)" /> {MY_INTERVIEW.dur} · {MY_INTERVIEW.mode}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", marginRight: "auto", display: "inline-flex", gap: 8, alignItems: "center" }}>
                With {MY_INTERVIEW.panel.join(" & ")}
              </span>
              <Btn kind="soft" icon="calendar">Add to calendar</Btn>
              <Btn kind="primary" trail="arrow">Join details</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* right column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        {/* contact / profile */}
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: 0 }}>Profile</h2>
            <button onClick={() => {}} style={{ display: "inline-flex", gap: 5, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--brand)", fontWeight: 600, fontSize: "var(--fs-sm)" }}><I n="settings" s={14} /> Edit</button>
          </div>
          {[["mail", ME.email], ["dot", ME.phone], ["pin", ME.loc]].map(([ic, v]) => (
            <div key={v} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
              <I n={ic === "pin" ? "dot" : ic} s={16} c="var(--ink-3)" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* résumé management */}
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: "0 0 12px" }}>Résumé</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)" }}>
            <span style={{ width: 38, height: 38, borderRadius: "var(--r)", flexShrink: 0, background: "var(--danger-tint)", color: "var(--danger)", display: "grid", placeItems: "center" }}><I n="fileText" s={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ME.resume.file}</div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>{ME.resume.size} · Updated {ME.resume.updated}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 11 }}>
            <Btn kind="soft" icon="arrowUp" full>Replace</Btn>
            <Btn kind="ghost" icon="eye">View</Btn>
          </div>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)", margin: "12px 0 0", lineHeight: 1.5 }}>We reuse this résumé when you apply, so you never have to upload it twice.</p>
        </div>

        {/* offers, honest empty state */}
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: "0 0 12px" }}>Offers</h2>
          <div style={{ textAlign: "center", padding: "14px 8px", color: "var(--ink-3)" }}>
            <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--surface-2)", color: "var(--ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="fileText" s={20} /></span>
            <p style={{ fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>No offers yet. Any offers will appear here with full details to review.</p>
          </div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 18 }}><AINotice /></div>
  </div>;
}

function App() {
  const [page, setPage] = useState("jobs");
  const [job, setJob] = useState(JOBS[0]);
  const go = (p, j) => { if (j) setJob(j); setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Nav go={go} page={page} />
    <main style={{ flex: 1 }}>
      {page === "jobs" && <JobBoard go={go} />}
      {page === "apply" && <Apply job={job} go={go} />}
      {page === "status" && <Status go={go} />}
      {page === "transparency" && <Transparency go={go} />}
      {page === "appeal" && <Appeal go={go} />}
      {page === "profile" && <Profile go={go} />}
    </main>
    <Footer />
  </div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
