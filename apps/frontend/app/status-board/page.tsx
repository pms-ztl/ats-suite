"use client";
// app/status-board/page.tsx
// Public system status board. This is an ANONYMOUS page: the only live health
// aggregate (/api/super-admin/health) is SUPER_ADMIN-gated and not reachable
// here, so we do NOT present measured-looking uptime / latency / incident
// figures we cannot back. The uptime%, avg-latency and 90-day history are shown
// as honest "Not measured" states, and the component / agent rows are labelled a
// catalog (status not probed on this public page) rather than asserting
// "Operational". The prototype's numbers (99.98% / 142ms / degraded bar) are
// intentionally removed as fabricated.

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

type StatusRow = { nm: string; desc: string };

const COMPONENTS: StatusRow[] = [
  { nm: "Web application", desc: "Dashboard, pipelines, and settings" },
  { nm: "Candidate portal", desc: "Job boards, applications, status pages" },
  { nm: "API & webhooks", desc: "REST API and outbound events" },
  { nm: "Email & notifications", desc: "Transactional email and alerts" },
  { nm: "Scheduling & calendar", desc: "Interview scheduling and invites" },
  { nm: "Authentication & SSO", desc: "Login, SAML/OIDC, MFA" },
];

const AGENTS: StatusRow[] = [
  { nm: "candidate-screener", desc: "Evidence-backed candidate scoring" },
  { nm: "jd-author", desc: "Inclusive job-description drafting" },
  { nm: "bias-auditor", desc: "Adverse-impact monitoring" },
  { nm: "copilot", desc: "In-product assistant" },
  { nm: "offer-agent", desc: "Offer-letter drafting" },
];

// This public page cannot probe live health (the health aggregate is
// SUPER_ADMIN-gated), so a row lists the component/agent without asserting a
// measured "Operational" state we cannot back.
function StatusRowItem({ nm, desc }: StatusRow) {
  return (
    <div className="row">
      <div>
        <div className="nm">{nm}</div>
        <div className="desc">{desc}</div>
      </div>
    </div>
  );
}

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
        <span className="eyebrow">System status</span>
        <h1>Platform <em>status.</em></h1>

        <div className="banner">
          <div><h2>Live status is not published here</h2><p>Detailed uptime and incident telemetry is available to operators in the admin console. This public page lists the platform components and AI agents.</p></div>
        </div>

        <div className="metrics">
          <div className="metric"><div className="v" style={{ color: "rgba(26,26,26,.4)" }}>Not measured</div><div className="l">Uptime · 90 days</div></div>
          <div className="metric"><div className="v" style={{ color: "rgba(26,26,26,.4)" }}>Not measured</div><div className="l">Avg API response</div></div>
          <div className="metric"><div className="v" style={{ color: "rgba(26,26,26,.4)" }}>Not measured</div><div className="l">Active incidents</div></div>
        </div>

        <div className="sec">Components</div>
        <div className="list" id="comp">
          {COMPONENTS.map((r) => (
            <StatusRowItem key={r.nm} nm={r.nm} desc={r.desc} />
          ))}
        </div>

        <div className="sec">AI agents</div>
        <div className="list" id="agents">
          {AGENTS.map((r) => (
            <StatusRowItem key={r.nm} nm={r.nm} desc={r.desc} />
          ))}
        </div>

        <div className="foot">TalentFlow ATS · live health telemetry is available to operators in the admin console</div>
      </div>
    </div>
  );
}
