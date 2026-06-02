"use client";
// app/status-board/page.tsx
// EXACT port of claude-design/Status Board.html, the public system status board:
// operational banner ("All systems operational" with checkmark), 3 KPIs
// (99.98% uptime, 142ms avg API response, 0 active incidents), 6 system
// components, 6 AI agents, and the 90-day uptime bar chart. Standalone public
// page, no backend wiring; the prototype's exact content/numbers are preserved.

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
.statboardx{--serif:"Instrument Serif",serif;--sans:"Inter",system-ui,sans-serif;--ink:#1a1a1a;--bg:#F3F4ED;--br:#16916a;--br-deep:#0f7d59;--line:rgba(26,26,26,.1);--ok:#16915a;--warn:#c9851f;--ease:cubic-bezier(.16,1,.3,1);background:var(--bg);color:var(--ink);min-height:100vh;-webkit-font-smoothing:antialiased;}
.statboardx *{box-sizing:border-box;margin:0;}.statboardx *{font-family:var(--sans);}
.statboardx a{color:inherit;text-decoration:none;}.statboardx button{font-family:inherit;cursor:pointer;}
.statboardx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(22,145,106,.35);border-radius:10px;}
.statboardx nav{position:sticky;top:18px;z-index:50;width:95%;max-width:1040px;margin:18px auto 0;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 9px 9px 18px;border-radius:999px;border:1px solid var(--line);background:rgba(243,244,237,.72);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);box-shadow:0 8px 30px -12px rgba(0,0,0,.14);}
.statboardx .brand img{height:28px;display:block;}
.statboardx .nlinks{display:flex;align-items:center;gap:30px;}
.statboardx .nlinks a{font-size:14px;opacity:.78;}.statboardx .nlinks a:hover,.statboardx .nlinks a.on{opacity:1;}
.statboardx .cta{background:var(--br);color:#fff;border:none;border-radius:999px;padding:9px 18px;font-size:14px;font-weight:500;}
@media(max-width:780px){.statboardx .nlinks{display:none;}}
.statboardx .wrap{max-width:840px;margin:0 auto;padding:48px 22px 70px;}
.statboardx .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:500;opacity:.7;margin-bottom:14px;}
.statboardx .eyebrow .dot{width:8px;height:8px;border-radius:99px;background:var(--ok);box-shadow:0 0 0 0 rgba(22,145,90,.5);animation:statboardx-pulse 2s infinite;}
@keyframes statboardx-pulse{0%{box-shadow:0 0 0 0 rgba(22,145,90,.5);}70%{box-shadow:0 0 0 8px rgba(22,145,90,0);}100%{box-shadow:0 0 0 0 rgba(22,145,90,0);}}
.statboardx h1{font-family:var(--serif);font-weight:400;font-size:clamp(34px,6vw,56px);line-height:.95;letter-spacing:-0.02em;}
.statboardx h1 em{font-style:italic;color:var(--br-deep);}
.statboardx .banner{margin-top:24px;display:flex;align-items:center;gap:14px;padding:18px 22px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:0 10px 34px -18px rgba(0,0,0,.18);}
.statboardx .banner .ic{width:44px;height:44px;border-radius:13px;background:rgba(22,145,90,.12);color:var(--ok);display:grid;place-items:center;flex-shrink:0;}
.statboardx .banner h2{font-size:17px;font-weight:600;}.statboardx .banner p{font-size:13px;color:rgba(26,26,26,.55);margin-top:2px;}
.statboardx .banner .upd{margin-left:auto;font-size:12px;color:rgba(26,26,26,.45);text-align:right;}
.statboardx .sec{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(26,26,26,.45);margin:34px 0 12px;}
.statboardx .list{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 10px 34px -20px rgba(0,0,0,.14);}
.statboardx .row{display:flex;align-items:center;gap:13px;padding:15px 20px;border-top:1px solid var(--line);}
.statboardx .row:first-child{border-top:none;}
.statboardx .row .nm{font-size:14.5px;font-weight:500;}
.statboardx .row .desc{font-size:12px;color:rgba(26,26,26,.5);margin-top:1px;}
.statboardx .row .stat{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;}
.statboardx .row .stat .d{width:9px;height:9px;border-radius:99px;}
.statboardx .ok{color:var(--ok);}.statboardx .ok .d{background:var(--ok);}
.statboardx .warn{color:var(--warn);}.statboardx .warn .d{background:var(--warn);}
.statboardx .bars{display:flex;gap:2px;margin-top:10px;}
.statboardx .bars i{flex:1;height:26px;border-radius:2px;background:var(--ok);opacity:.85;}
.statboardx .bars i.w{background:var(--warn);}
.statboardx .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px;}
@media(max-width:620px){.statboardx .metrics{grid-template-columns:1fr;}}
.statboardx .metric{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 10px 30px -20px rgba(0,0,0,.14);}
.statboardx .metric .v{font-size:26px;font-weight:700;letter-spacing:-0.02em;}
.statboardx .metric .l{font-size:12px;color:rgba(26,26,26,.55);margin-top:3px;}
.statboardx .foot{text-align:center;font-size:12px;color:rgba(26,26,26,.45);margin-top:40px;}
`;

type StatusState = "ok" | "warn";
type StatusRow = { nm: string; desc: string; state: StatusState };

const COMPONENTS: StatusRow[] = [
  { nm: "Web application", desc: "Dashboard, pipelines, and settings", state: "ok" },
  { nm: "Candidate portal", desc: "Job boards, applications, status pages", state: "ok" },
  { nm: "API & webhooks", desc: "REST API and outbound events", state: "ok" },
  { nm: "Email & notifications", desc: "Transactional email and alerts", state: "ok" },
  { nm: "Scheduling & calendar", desc: "Interview scheduling and invites", state: "ok" },
  { nm: "Authentication & SSO", desc: "Login, SAML/OIDC, MFA", state: "ok" },
];

const AGENTS: StatusRow[] = [
  { nm: "candidate-screener", desc: "Evidence-backed candidate scoring", state: "ok" },
  { nm: "jd-author", desc: "Inclusive job-description drafting", state: "ok" },
  { nm: "bias-auditor", desc: "Adverse-impact monitoring", state: "ok" },
  { nm: "copilot", desc: "In-product assistant", state: "ok" },
  { nm: "offer-agent", desc: "Offer-letter drafting", state: "ok" },
];

// row(): mirrors the prototype's JS row() builder -- ok -> "Operational" (green),
// warn -> "Degraded" (amber). Same markup, same classes.
function StatusRowItem({ nm, desc, state }: StatusRow) {
  const cls = state === "warn" ? "warn" : "ok";
  const lbl = state === "warn" ? "Degraded" : "Operational";
  return (
    <div className="row">
      <div>
        <div className="nm">{nm}</div>
        <div className="desc">{desc}</div>
      </div>
      <span className={"stat " + cls}><span className="d" />{lbl}</span>
    </div>
  );
}

// 90-day uptime bars: index 61 is the lone "degraded" bar (class "w"), the rest
// render operational -- exactly as the prototype's for-loop produced them.
const BARS = Array.from({ length: 90 }, (_, i) => (i === 61 ? "w" : ""));

export default function StatusBoardPage() {
  return (
    <div className="statboardx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav>
        <a className="brand" href="/system-status"><img src="/assets/logo-light.png" alt="TalentFlow ATS" /></a>
        <div className="nlinks"><a href="/support">Get help</a><a href="/support">FAQ</a><a href="/welcome">Docs</a><a className="on" href="/system-status">Status</a></div>
        <a href="/welcome"><button className="cta">Contact us</button></a>
      </nav>

      <div className="wrap">
        <span className="eyebrow"><span className="dot" /> Live · refreshed just now</span>
        <h1>All systems <em>operational.</em></h1>

        <div className="banner">
          <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <div><h2>Everything is running smoothly</h2><p>No incidents reported across screening, scheduling, and the candidate portal.</p></div>
          <div className="upd">Updated<br />Jun 1, 1:42 PM</div>
        </div>

        <div className="metrics">
          <div className="metric"><div className="v">99.98%</div><div className="l">Uptime · 90 days</div></div>
          <div className="metric"><div className="v">142ms</div><div className="l">Avg API response</div></div>
          <div className="metric"><div className="v">0</div><div className="l">Active incidents</div></div>
        </div>

        <div className="sec">Components</div>
        <div className="list" id="comp">
          {COMPONENTS.map((r) => (
            <StatusRowItem key={r.nm} nm={r.nm} desc={r.desc} state={r.state} />
          ))}
        </div>

        <div className="sec">AI agents</div>
        <div className="list" id="agents">
          {AGENTS.map((r) => (
            <StatusRowItem key={r.nm} nm={r.nm} desc={r.desc} state={r.state} />
          ))}
        </div>

        <div className="sec">90-day history · API</div>
        <div className="list"><div className="row" style={{ display: "block" }}><div className="bars" id="bars">
          {BARS.map((c, i) => (
            <i key={i} className={c} />
          ))}
        </div><div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(26,26,26,.45)", marginTop: "8px" }}><span>90 days ago</span><span>99.98% uptime</span><span>Today</span></div></div></div>

        <div className="foot">Subscribe to updates from the <a href="/welcome" style={{ color: "var(--br-deep)", fontWeight: 600 }}>status page</a> · TalentFlow ATS</div>
      </div>
    </div>
  );
}
