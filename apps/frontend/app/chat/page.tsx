"use client";
// app/chat/page.tsx
// VERBATIM port of claude-design/Chat.html (+ its external chat-app.js), the
// full-bleed standalone TalentFlow team-chat app. It carries its OWN chrome:
//   - an identity gate (cinematic CloudFront video background scrubbed by the
//     mouse via eased rAF, letter-by-letter "gtypeText" typewriter + blinking
//     cursor, teammate pills that fade in at 400ms),
//   - a conversation/thread-list sidebar (channel + DMs, search, presence dots),
//   - the active message thread (day dividers, grouped bubbles, typing dots),
//   - a composer (auto-grow textarea, Enter to send / Shift+Enter newline).
// Real-time cross-tab/window sync is reproduced exactly: BroadcastChannel +
// localStorage, per-tab identity via sessionStorage, 5s presence heartbeat,
// typing relay, theme toggle persisted to localStorage. No backend chat endpoint;
// the prototype's seeded threads/members are the visible content. useCurrentUser
// preselects the matching teammate pill when the signed-in user's name matches.
import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
.chatx{--font:'Hanken Grotesk', system-ui, sans-serif;--mono:'Geist Mono', monospace;--ease:cubic-bezier(.22, 1, .36, 1);}
.chatx, .chatx[data-theme=light]{--bg:#f3f5f2;--surface:#fff;--surface-2:#f4f6f3;--surface-3:#eaeee9;--ink:#16271d;--ink-2:#5a6b61;--ink-3:#8b988f;--line:#e3e8e3;--line-2:#d4dbd5;--brand:#16916a;--brand-2:#0f7d59;--brand-tint:#e4f4ec;--brand-ink:#0c5e44;--on-brand:#fff;--ai:#7c5cff;--ai-tint:#efeaff;--ai-ink:#5b3fd0;--ok:#16915a;--bubble-me:#16916a;--bubble-me-ink:#fff;--bubble-them:#fff;--bubble-them-ink:#16271d;}
.chatx[data-theme=dark]{--bg:#0e1512;--surface:#16201b;--surface-2:#1c281f;--surface-3:#24322a;--ink:#eaf2ec;--ink-2:#9db0a4;--ink-3:#6c7d72;--line:#26332b;--line-2:#32453a;--brand:#3fd9a6;--brand-2:#5fe3b8;--brand-tint:#1b3b2e;--brand-ink:#7fe6c2;--on-brand:#06160e;--ai:#9b8cff;--ai-tint:#2a2350;--ai-ink:#b9a8ff;--ok:#3fd9a6;--bubble-me:#16916a;--bubble-me-ink:#eafff5;--bubble-them:#1c281f;--bubble-them-ink:#eaf2ec;}
.chatx *{box-sizing:border-box;margin:0;}
.chatx, .chatx html, .chatx body{height:100%;}
.chatx{font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden;min-height:100vh;}
.chatx button, .chatx input, .chatx textarea{font-family:inherit;}.chatx a{color:inherit;text-decoration:none;}
.chatx .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;}
.chatx ::-webkit-scrollbar{width:9px;}.chatx ::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:9px;border:2px solid transparent;background-clip:content-box;}
/* identity gate, cinematic Mainframe-style hero */
.chatx .gate{position:fixed;inset:0;z-index:100;overflow:hidden;background:#06100c;display:flex;flex-direction:column;}
.chatx .gate.hidden{display:none;}
.chatx .gate #gv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:70% center;z-index:0;}
.chatx .gate .gscrim{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(100deg, rgba(6, 16, 12, .82) 0%, rgba(6, 16, 12, .5) 42%, rgba(6, 16, 12, .28) 72%), linear-gradient(0deg, rgba(6, 16, 12, .78), transparent 46%);}
.chatx .gate .gnav{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:20px clamp(20px, 4vw, 36px);}
.chatx .gate .gnav .gl{display:flex;align-items:center;gap:11px;}
.chatx .gate .gnav .gl img{height:26px;display:block;}
.chatx .gate .gnav .gtag{font-family:'HelveticaNowDisplay-Medium', 'Hanken Grotesk', sans-serif;color:#fff;font-size:15px;letter-spacing:-.01em;}
.chatx .gate .gnav .gtag i{font-style:normal;color:rgba(255, 255, 255, .5);}
.chatx .gate .gnav .ast{color:var(--brand);font-size:26px;line-height:1;user-select:none;}
.chatx .gate .gnav .gright{font-size:14px;color:rgba(255, 255, 255, .7);text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.chatx .gate .gnav .gright:hover{color:#fff;}
.chatx .gate .gbody{position:relative;z-index:5;flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:0 clamp(20px, 4vw, 40px) clamp(34px, 6vw, 60px);overflow:hidden;}
.chatx .gate .gintro{pointer-events:none;user-select:none;margin-bottom:18px;font-size:clamp(17px, 3.4vw, 24px);line-height:1.3;font-weight:400;color:#bfe9d6;filter:blur(4px);}
.chatx .gate .gtype{color:#fff;margin-bottom:22px;font-family:'HelveticaNowDisplay-Medium', 'Hanken Grotesk', sans-serif;font-size:clamp(26px, 5.4vw, 52px);line-height:1.06;font-weight:500;letter-spacing:-.02em;max-width:18ch;min-height:1.1em;text-shadow:0 2px 30px rgba(6, 16, 12, .6);}
.chatx .gate .gtype .it{color:var(--brand);}
.chatx .gate .gcur{display:inline-block;width:3px;height:1em;background:var(--brand);vertical-align:-2px;margin-left:3px;animation:chatx-gblink 1s step-end infinite;}
@keyframes chatx-gblink{0%, 100%{opacity:1;}50%{opacity:0;}}
.chatx .gate .glabel{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255, 255, 255, .55);margin-bottom:13px;display:flex;align-items:center;gap:9px;}
.chatx .gate .glabel .gd{width:6px;height:6px;border-radius:50%;background:var(--brand);box-shadow:0 0 10px var(--brand);animation:chatx-gblink 2.4s infinite;}
.chatx .gate .who{display:flex;flex-wrap:wrap;gap:9px;max-width:760px;opacity:0;transform:translateY(10px);transition:opacity .5s ease, transform .5s ease;}
.chatx .gate .who.show{opacity:1;transform:none;}
.chatx .gate .who button{display:inline-flex;align-items:center;gap:9px;padding:8px 16px 8px 8px;border-radius:999px;border:1px solid rgba(255, 255, 255, .2);background:rgba(255, 255, 255, .07);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;cursor:pointer;text-align:left;transition:background .18s, border-color .18s, transform .15s;white-space:nowrap;}
.chatx .gate .who button:hover{background:#fff;color:#06100c;border-color:#fff;transform:translateY(-2px);}
.chatx .gate .who button .pn{font-weight:600;font-size:14px;line-height:1.1;}
.chatx .gate .who button .pr{font-size:11px;opacity:.62;}
.chatx .gate .who button:hover .pr{opacity:.7;}
.chatx .gate .ghint{position:relative;z-index:5;font-size:11.5px;color:rgba(255, 255, 255, .5);padding:0 clamp(20px, 4vw, 40px) 22px;display:flex;gap:7px;align-items:center;line-height:1.45;max-width:640px;}
@media(prefers-reduced-motion:reduce){.chatx .gate #gv{display:none;}.chatx .gate .gcur, .chatx .gate .glabel .gd{animation:none;}.chatx .gate .who{opacity:1;transform:none;}}
.chatx .av{border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-weight:700;color:#fff;}
/* app shell */
.chatx .app{display:grid;grid-template-columns:300px 1fr;height:100vh;}
@media(max-width:780px){.chatx .app{grid-template-columns:1fr;}.chatx .app.show-thread .side{display:none;}.chatx .app:not(.show-thread) .main{display:none;}}
.chatx .side{border-right:1px solid var(--line);background:var(--surface);display:flex;flex-direction:column;min-height:0;}
.chatx .side .sh{padding:16px 16px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px;}
.chatx .side .sh .logo{height:22px;}
.chatx .side .me{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:4px 10px 4px 4px;cursor:pointer;}
.chatx .search{margin:12px;display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;border-radius:11px;background:var(--surface-2);border:1px solid var(--line);}
.chatx .search input{flex:1;border:none;outline:none;background:transparent;font-size:13.5px;color:var(--ink);}
.chatx .scroll{flex:1;overflow-y:auto;padding:4px 8px 14px;min-height:0;}
.chatx .grp{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);padding:12px 10px 6px;}
.chatx .conv{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:12px;cursor:pointer;transition:background .12s;position:relative;}
.chatx .conv:hover{background:var(--surface-2);}
.chatx .conv.on{background:var(--brand-tint);}
.chatx .conv .nm{display:flex;align-items:center;gap:6px;min-width:0;}
.chatx .conv .nmtxt{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.chatx .conv .last{display:block;font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.chatx .conv .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}
.chatx .conv .pres{position:absolute;left:31px;bottom:8px;width:11px;height:11px;border-radius:50%;border:2px solid var(--surface);background:var(--ink-3);}
.chatx .conv.on .pres{border-color:var(--brand-tint);}
.chatx .conv .pres.online{background:var(--ok);}
.chatx .conv .un{min-width:19px;height:19px;border-radius:999px;background:var(--brand);color:var(--on-brand);font-size:11px;font-weight:700;display:grid;place-items:center;padding:0 5px;}
.chatx .role-pill{font-size:10px;font-weight:700;color:var(--ai-ink);background:var(--ai-tint);border-radius:5px;padding:1px 6px;flex-shrink:0;white-space:nowrap;}
/* main */
.chatx .main{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--bg);}
.chatx .thh{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid var(--line);background:var(--surface);}
.chatx .thh .back{display:none;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);align-items:center;justify-content:center;cursor:pointer;}
@media(max-width:780px){.chatx .thh .back{display:flex;}}
.chatx .thh .ti{font-weight:700;font-size:15.5px;}
.chatx .thh .st{font-size:12px;color:var(--ink-3);}
.chatx .thh .actions{margin-left:auto;display:flex;gap:6px;}
.chatx .iconbtn{width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);display:grid;place-items:center;cursor:pointer;}
.chatx .iconbtn:hover{color:var(--brand);border-color:var(--line-2);}
.chatx .msgs{flex:1;overflow-y:auto;padding:20px 18px 8px;display:flex;flex-direction:column;gap:3px;min-height:0;}
.chatx .daydiv{align-self:center;font-size:11px;font-weight:600;color:var(--ink-3);background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:3px 12px;margin:12px 0;}
.chatx .row{display:flex;gap:9px;align-items:flex-end;max-width:74%;}
.chatx .row.me{align-self:flex-end;flex-direction:row-reverse;}
.chatx .row .ava{width:28px;height:28px;font-size:11px;align-self:flex-end;}
.chatx .row.cont .ava{visibility:hidden;}
.chatx .bub{padding:9px 13px;border-radius:16px;font-size:14px;line-height:1.45;word-wrap:break-word;position:relative;box-shadow:0 1px 1px rgba(0, 30, 15, .04);}
.chatx .row.them .bub{background:var(--bubble-them);color:var(--bubble-them-ink);border:1px solid var(--line);border-bottom-left-radius:5px;}
.chatx .row.me .bub{background:var(--bubble-me);color:var(--bubble-me-ink);border-bottom-right-radius:5px;}
.chatx .row.cont.them .bub{border-bottom-left-radius:16px;border-top-left-radius:5px;}
.chatx .row.cont.me .bub{border-bottom-right-radius:16px;border-top-right-radius:5px;}
.chatx .sender{font-size:11.5px;font-weight:700;color:var(--ai-ink);margin:0 0 3px 38px;}
.chatx .meta{font-size:10px;color:var(--ink-3);margin:1px 38px 0;}
.chatx .row.me + .meta, .chatx .metame{text-align:right;}
.chatx .typing{display:flex;gap:9px;align-items:center;padding:2px 0 6px;}
.chatx .typing .ava{width:28px;height:28px;font-size:11px;}
.chatx .dots{display:flex;gap:3px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:9px 12px;}
.chatx .dots i{width:6px;height:6px;border-radius:50%;background:var(--ink-3);animation:chatx-td 1.2s infinite;}
.chatx .dots i:nth-child(2){animation-delay:.2s;}.chatx .dots i:nth-child(3){animation-delay:.4s;}
@keyframes chatx-td{0%, 60%, 100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}
.chatx .composer{padding:12px 16px 16px;border-top:1px solid var(--line);background:var(--surface);}
.chatx .cbox{display:flex;gap:10px;align-items:flex-end;background:var(--surface-2);border:1px solid var(--line-2);border-radius:16px;padding:8px 8px 8px 14px;transition:border-color .15s, box-shadow .15s;}
.chatx .cbox:focus-within{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-tint);}
.chatx .cbox textarea{flex:1;border:none;outline:none;background:transparent;resize:none;font-size:14.5px;color:var(--ink);line-height:1.4;max-height:130px;padding:6px 0;}
.chatx .send{width:40px;height:40px;border-radius:12px;border:none;background:var(--brand);color:var(--on-brand);display:grid;place-items:center;cursor:pointer;flex-shrink:0;transition:transform .12s, opacity .15s;}
.chatx .send:hover{transform:scale(1.05);}.chatx .send:disabled{opacity:.45;cursor:default;transform:none;}
.chatx .chint{font-size:11px;color:var(--ink-3);margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.chatx .kbd{font-family:var(--mono);font-size:10px;background:var(--surface-2);border:1px solid var(--line);border-radius:5px;padding:1px 5px;}
.chatx .empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;color:var(--ink-3);padding:30px;}
.chatx .menu{position:fixed;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 50px -16px rgba(0, 30, 15, .3);padding:7px;z-index:60;min-width:200px;display:none;}
.chatx .menu.open{display:block;}
.chatx .menu button{width:100%;display:flex;align-items:center;gap:9px;padding:9px 11px;border:none;background:transparent;border-radius:9px;font-size:13.5px;font-weight:500;color:var(--ink);cursor:pointer;text-align:left;}
.chatx .menu button:hover{background:var(--surface-2);}
`;

/* ---- tier-3 team (under the workspace admin) ---- */
type Member = { id: string; name: string; role: string; color: string };
const TEAM: Member[] = [
  { id: "u_avery", name: "Avery Chen", role: "Recruiting Lead", color: "#16916a" },
  { id: "u_marcus", name: "Marcus Bell", role: "Recruiter", color: "#2563eb" },
  { id: "u_sofia", name: "Sofia Nguyen", role: "Sourcer", color: "#7c5cff" },
  { id: "u_priya", name: "Priya Sharma", role: "Coordinator", color: "#c2410c" },
  { id: "u_jordan", name: "Jordan Lee", role: "Interviewer", color: "#0891b2" },
  { id: "u_lena", name: "Lena Whitfield", role: "Hiring Manager", color: "#db2777" },
];
const CHANNEL = { id: "ch_team", name: "# hiring-team", role: "Everyone" };
function user(id: string): Member | undefined { return TEAM.filter((u) => u.id === id)[0]; }
function initials(n: string) { return n.split(" ").map((w) => w[0]).join("").slice(0, 2); }
function convId(a: string, b: string) { return [a, b].sort().join("~"); }

type ChatMsg = { id: string; conv: string; from: string; text: string; ts: number };

const MSG_KEY = "tf-chat-msgs", PRES_KEY = "tf-chat-pres";
function loadMsgs(): ChatMsg[] { try { return JSON.parse(localStorage.getItem(MSG_KEY) || "[]"); } catch (e) { return []; } }
function saveMsgs(m: ChatMsg[]) { localStorage.setItem(MSG_KEY, JSON.stringify(m)); }
function seed() {
  const now = Date.now();
  const s: ChatMsg[] = [
    { id: "m1", conv: "ch_team", from: "u_lena", text: "Morning team! Backend pipeline is heating up, 38 candidates in screening.", ts: now - 1000 * 60 * 92 },
    { id: "m2", conv: "ch_team", from: "u_marcus", text: "On it. The screener flagged 3 for human review, I'll take those this morning.", ts: now - 1000 * 60 * 88 },
    { id: "m3", conv: "ch_team", from: "u_sofia", text: "Sourced 6 more from the referral list, adding them to the req now 👍", ts: now - 1000 * 60 * 71 },
    { id: "m4", conv: convId("u_avery", "u_marcus"), from: "u_marcus", text: "Hey, can you double-check Dana Osei's verdict before we advance?", ts: now - 1000 * 60 * 40 },
    { id: "m5", conv: convId("u_avery", "u_marcus"), from: "u_avery", text: "Yep, 84 match, 0.88 confidence, evidence checks out. Good to advance.", ts: now - 1000 * 60 * 36 },
    { id: "m6", conv: convId("u_avery", "u_priya"), from: "u_priya", text: "Scheduling the technical loop for Priya Raman, Tue 2pm work for the panel?", ts: now - 1000 * 60 * 18 },
  ];
  saveMsgs(s);
}

function fmtDay(ts: number) {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return "Today";
  const y = new Date(t.getTime() - 864e5);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

const GV_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const TYPE_TXT = "Glad you stopped in. Great hires start with great people. So, who's joining us?";
const APP_HREF = "/";

export default function ChatPage() {
  const { user: currentUser } = useCurrentUser();

  // ---- identity (per tab) ----
  const [me, setMe] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(true);
  // active conversation: a userId (DM) or 'ch_team'
  const [active, setActive] = useState<string | null>(null);
  const [showThread, setShowThread] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [filter, setFilter] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  // gate animation state
  const [typed, setTyped] = useState("");
  const [curHidden, setCurHidden] = useState(false);
  const [whoShow, setWhoShow] = useState(false);

  // realtime caches (kept in refs so handlers always see latest; a tick state
  // forces re-render when they change)
  const onlineRef = useRef<Record<string, number>>({});
  const typingFromRef = useRef<Record<string, { id: string; ts: number }>>({});
  const meRef = useRef<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const gv = useRef<HTMLVideoElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const meBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const draftRef = useRef("");
  const [canSend, setCanSend] = useState(false);

  useEffect(() => { meRef.current = me; }, [me]);
  useEffect(() => { activeRef.current = active; }, [active]);

  function convFor(a: string | null) { return a === "ch_team" ? "ch_team" : convId(meRef.current as string, a as string); }
  function isOnline(id: string) { return id === meRef.current || (!!onlineRef.current[id] && Date.now() - onlineRef.current[id] < 16000); }

  // ---- boot: theme, seed, identity, broadcast channel ----
  useEffect(() => {
    let storedTheme: string | null = null;
    try { storedTheme = localStorage.getItem("cdc-theme"); } catch (e) {}
    setTheme((storedTheme as "light" | "dark") || "light");
    try { if (!localStorage.getItem(MSG_KEY)) seed(); } catch (e) {}

    let storedMe: string | null = null;
    try { storedMe = sessionStorage.getItem("tf-chat-me"); } catch (e) {}
    if (storedMe && user(storedMe)) {
      meRef.current = storedMe;
      setMe(storedMe);
      setActive("ch_team");
      activeRef.current = "ch_team";
      setGateOpen(false);
      onlineRef.current[storedMe] = Date.now();
    } else {
      setGateOpen(true);
    }

    const bc = (typeof BroadcastChannel !== "undefined") ? new BroadcastChannel("tf-chat") : null;
    bcRef.current = bc;

    function onRemote(data: any) {
      if (!data) return;
      if (data.t === "msg") { rerender(); }
      else if (data.t === "pres") { onlineRef.current[data.p.id] = data.p.ts; rerender(); }
      else if (data.t === "typing") { typingFromRef.current[data.x.conv] = { id: data.x.from, ts: Date.now() }; rerender(); }
    }
    if (bc) bc.onmessage = (e) => onRemote(e.data);

    function onStorage(e: StorageEvent) {
      if (e.key === MSG_KEY) { rerender(); }
      else if (e.key === PRES_KEY && e.newValue) { try { const p = JSON.parse(e.newValue.split("|")[0]); onlineRef.current[p.id] = p.ts; rerender(); } catch (x) {} }
    }
    window.addEventListener("storage", onStorage);

    function onBeforeUnload() { if (meRef.current) delete onlineRef.current[meRef.current]; }
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (bc) bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- presence heartbeat (every 5s) + stale-typing sweep (every 1.5s) ----
  useEffect(() => {
    function beat() {
      if (!meRef.current) return;
      onlineRef.current[meRef.current] = Date.now();
      const p = { id: meRef.current, ts: Date.now() };
      if (bcRef.current) bcRef.current.postMessage({ t: "pres", p });
      try { localStorage.setItem(PRES_KEY, JSON.stringify(p) + "|" + Math.random()); } catch (e) {}
    }
    const hb = setInterval(() => { beat(); rerender(); }, 5000);
    const sweep = setInterval(() => {
      let ch = false;
      for (const k in typingFromRef.current) { if (Date.now() - typingFromRef.current[k].ts > 3200) { delete typingFromRef.current[k]; ch = true; } }
      if (ch) rerender();
    }, 1500);
    return () => { clearInterval(hb); clearInterval(sweep); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- gate animations: video mouse-scrub, typewriter, pills ----
  useEffect(() => {
    if (!gateOpen) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // typewriter
    let typeTimer: ReturnType<typeof setTimeout> | null = null;
    if (reduce) { setTyped(TYPE_TXT); setCurHidden(true); }
    else {
      let i = 0;
      const step = () => {
        setTyped(TYPE_TXT.slice(0, i)); i++;
        if (i <= TYPE_TXT.length) typeTimer = setTimeout(step, 38); else setCurHidden(true);
      };
      typeTimer = setTimeout(step, 600);
    }

    // pills appear at 400ms regardless of typing
    const pillTimer = setTimeout(() => setWhoShow(true), 400);

    // mouse-scrub video (eased rAF, no seek-flooding)
    const v = gv.current;
    let prevX: number | null = null, target = 0, shown = 0.01, seeking = false;
    const SENS = 0.8;
    let raf: number | null = null;
    function onMove(e: MouseEvent) {
      if (prevX === null) { prevX = e.clientX; return; }
      const d = e.clientX - prevX; prevX = e.clientX;
      if (!v || !v.duration) return;
      target += (d / window.innerWidth) * SENS * v.duration;
      target = Math.max(0, Math.min(v.duration, target));
    }
    function onSeeked() { seeking = false; }
    function loop() {
      if (v && v.duration) {
        shown += (target - shown) * 0.16;
        if (!seeking && Math.abs(v.currentTime - shown) > 0.02) { seeking = true; try { v.currentTime = shown; } catch (e) { seeking = false; } }
      }
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("mousemove", onMove);
    if (v) {
      v.addEventListener("seeked", onSeeked);
      const onLoaded = () => { if (raf === null) raf = requestAnimationFrame(loop); };
      v.addEventListener("loadeddata", onLoaded);
      if (v.readyState >= 1 && raf === null) raf = requestAnimationFrame(loop);
      // assign src after listeners are bound, mirroring the prototype
      if (!v.src) v.src = GV_SRC;
      return () => {
        if (typeTimer) clearTimeout(typeTimer);
        clearTimeout(pillTimer);
        window.removeEventListener("mousemove", onMove);
        v.removeEventListener("seeked", onSeeked);
        v.removeEventListener("loadeddata", onLoaded);
        if (raf !== null) cancelAnimationFrame(raf);
      };
    }
    return () => {
      if (typeTimer) clearTimeout(typeTimer);
      clearTimeout(pillTimer);
      window.removeEventListener("mousemove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateOpen]);

  // ---- close me-menu on outside click ----
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (meBtnRef.current && meBtnRef.current.contains(t)) return;
      setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---- auto-scroll the message list to the bottom after every render ----
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  });

  // ---- focus the composer when the active thread changes ----
  useEffect(() => {
    if (!gateOpen && active) { const id = setTimeout(() => { ta.current && ta.current.focus(); }, 0); return () => clearTimeout(id); }
    return undefined;
  }, [active, gateOpen]);

  function pickIdentity(id: string) {
    meRef.current = id;
    setMe(id);
    try { sessionStorage.setItem("tf-chat-me", id); } catch (e) {}
    setActive("ch_team");
    activeRef.current = "ch_team";
    setGateOpen(false);
    onlineRef.current[id] = Date.now();
    rerender();
  }

  function openConv(id: string) {
    setActive(id);
    activeRef.current = id;
    setShowThread(true);
    rerender();
  }

  function sendTyping() {
    if (!meRef.current || !activeRef.current) return;
    const t = { from: meRef.current, conv: convFor(activeRef.current) };
    if (bcRef.current) bcRef.current.postMessage({ t: "typing", x: t });
  }

  function onTaInput() {
    const el = ta.current; if (!el) return;
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 130) + "px";
    draftRef.current = el.value;
    setCanSend(!!el.value.trim());
    sendTyping();
  }

  function doSend() {
    const el = ta.current; if (!el) return;
    const text = el.value.trim(); if (!text) return;
    const convk = convFor(activeRef.current);
    const m: ChatMsg = { id: "m" + Date.now() + Math.random().toString(36).slice(2, 6), conv: convk, from: meRef.current as string, text, ts: Date.now() };
    const all = loadMsgs(); all.push(m); saveMsgs(all);
    el.value = ""; el.style.height = "auto"; draftRef.current = ""; setCanSend(false);
    if (bcRef.current) bcRef.current.postMessage({ t: "msg", m });
    rerender();
  }

  function onTaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("cdc-theme", next); } catch (e) {}
    setMenuOpen(false);
  }

  function openMeMenu(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ left: r.left, top: r.bottom + 6 });
    setMenuOpen((o) => !o);
  }

  // preselect the teammate whose name matches the signed-in user (highlight only)
  const meMatchId = currentUser
    ? TEAM.find((u) => u.name.toLowerCase() === (currentUser.name || "").toLowerCase())?.id ?? null
    : null;

  const dark = theme === "dark";
  const meUser = me ? user(me) : undefined;

  // ---- sidebar conversation list ----
  function lastMsg(conv: string): ChatMsg | null { const m = loadMsgs().filter((x) => x.conv === conv); return m.length ? m[m.length - 1] : null; }
  function preview(m: ChatMsg) { return (m.from === meRef.current ? "You: " : "") + m.text; }

  const chLast = me ? lastMsg("ch_team") : null;
  const dmMembers = me ? TEAM.filter((u) => u.id !== me && (!filter || u.name.toLowerCase().indexOf(filter) >= 0)) : [];

  // ---- thread data ----
  const isCh = active === "ch_team";
  const threadUser = !isCh && active ? user(active) : null;
  const convk = active ? convFor(active) : "";
  const title = isCh ? CHANNEL.name : threadUser?.name;
  const sub = isCh
    ? TEAM.length + " members · everyone under the admin"
    : (active && isOnline(active) ? "Active now" : "Offline") + " · " + (threadUser?.role ?? "");

  // build the message rows (day dividers + grouped bubbles) the same way the
  // prototype's renderMsgs() did
  const threadMsgs = active ? loadMsgs().filter((x) => x.conv === convk) : [];
  const rows: React.ReactNode[] = [];
  let lastDay = "", lastFrom: string | null = null;
  threadMsgs.forEach((m) => {
    const day = fmtDay(m.ts);
    if (day !== lastDay) { rows.push(<div className="daydiv" key={"d" + m.id}>{day}</div>); lastDay = day; lastFrom = null; }
    const mine = m.from === me;
    const u = user(m.from) as Member;
    const cont = lastFrom === m.from;
    if (isCh && !mine && !cont) rows.push(<div className="sender" key={"s" + m.id}>{u.name}</div>);
    rows.push(
      <div className={"row " + (mine ? "me" : "them") + (cont ? " cont" : "")} key={m.id}>
        <span className="av ava" style={{ background: u.color }}>{initials(u.name)}</span>
        <div className="bub">{m.text}</div>
      </div>
    );
    lastFrom = m.from;
  });
  // typing indicator
  const tp = active ? typingFromRef.current[convk] : undefined;
  let typingNode: React.ReactNode = null;
  if (tp && tp.id !== me && Date.now() - tp.ts < 3000) {
    const tu = user(tp.id) as Member;
    typingNode = (
      <div className="typing">
        <span className="av ava" style={{ background: tu.color }}>{initials(tu.name)}</span>
        <div className="dots"><i /><i /><i /></div>
      </div>
    );
  }

  return (
    <div className="chatx" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* identity gate, cinematic Mainframe-style hero */}
      <div className={"gate" + (gateOpen ? "" : " hidden")} id="gate">
        <video id="gv" ref={gv} muted playsInline preload="auto" />
        <div className="gscrim" />
        <div className="gnav">
          <span className="gl">
            <img className="brandlogo brandlogo-l" src="/assets/logo-dark.png" alt="TalentFlow" style={{ display: dark ? "none" : "block" }} />
            <span className="gtag">TalentFlow <i>Chat</i></span>
            <span className="ast">{"✳︎"}</span>
          </span>
          <a className="gright" href={APP_HREF}>Back to app</a>
        </div>
        <div className="gbody">
          <div className="gintro">Hey there, meet A.R.I.A, <br />TalentFlow's Adaptive Recruiting Interface Agent</div>
          <h2 className="gtype"><span id="gtypeText">{typed}</span><span className="gcur" id="gcur" style={curHidden ? { display: "none" } : undefined} /></h2>
          <div className="glabel"><span className="gd" /> Sign in as your teammate</div>
          <div className={"who" + (whoShow ? " show" : "")} id="whoList">
            {TEAM.map((u) => (
              <button
                key={u.id}
                data-id={u.id}
                onClick={() => pickIdentity(u.id)}
                style={meMatchId === u.id ? { background: "#fff", color: "#06100c", borderColor: "#fff" } : undefined}
              >
                <span className="av" style={{ width: 30, height: 30, fontSize: 12, background: u.color }}>{initials(u.name)}</span>
                <span><span className="pn">{u.name}</span><span className="pr">{u.role}</span></span>
              </button>
            ))}
          </div>
        </div>
        <div className="ghint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16v-4M12 8h.01" /></svg>
          <span>Real-time syncs across tabs &amp; windows on this browser. Open a second window as a different teammate to watch it live.</span>
        </div>
      </div>

      <div className={"app" + (showThread ? " show-thread" : "")} id="app">
        {/* sidebar */}
        <aside className="side">
          <div className="sh">
            <img className="logo brandlogo brandlogo-l" src="/assets/logo-light.png" alt="TalentFlow" style={{ display: dark ? "none" : "block" }} />
            <img className="logo brandlogo brandlogo-d" src="/assets/logo-dark.png" alt="TalentFlow" style={{ display: dark ? "block" : "none" }} />
            <button className="me" id="meBtn" ref={meBtnRef} onClick={openMeMenu}>
              <span className="av" id="meAv" style={{ width: 26, height: 26, fontSize: 11, background: meUser?.color }}>{meUser ? initials(meUser.name) : ""}</span>
              <span id="meName">{meUser ? meUser.name.split(" ")[0] : ""}</span>
            </button>
          </div>
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8" /></svg>
            <input id="search" placeholder="Search teammates…" value={filter} onChange={(e) => setFilter(e.target.value.toLowerCase())} />
          </div>
          <div className="scroll" id="convList">
            {me && (
              <>
                <div className="grp">Channels</div>
                <Conv id="ch_team" name={CHANNEL.name} last={chLast ? preview(chLast) : "No messages yet"} u={null} on={active === "ch_team"} onClick={() => openConv("ch_team")} />
                <div className="grp">Direct messages · your team</div>
                {dmMembers.map((u) => {
                  const lm = lastMsg(convId(me, u.id));
                  return <Conv key={u.id} id={u.id} name={u.name} last={lm ? preview(lm) : u.role} u={u} on={active === u.id} online={isOnline(u.id)} onClick={() => openConv(u.id)} />;
                })}
              </>
            )}
          </div>
        </aside>
        {/* thread */}
        <main className="main" id="main">
          {!active ? (
            <div className="empty">Pick a conversation.</div>
          ) : (
            <>
              <div className="thh">
                <button className="back" id="back" onClick={() => setShowThread(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                {isCh ? (
                  <span className="av" style={{ width: 38, height: 38, fontSize: 16, background: "var(--brand-tint)", color: "var(--brand)" }}>#</span>
                ) : (
                  <span className="av" style={{ width: 38, height: 38, fontSize: 14, background: threadUser?.color }}>{threadUser ? initials(threadUser.name) : ""}</span>
                )}
                <div><div className="ti">{title}</div><div className="st" id="subline">{sub}</div></div>
                <div className="actions">
                  <button className="iconbtn" title="Call"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg></button>
                  <button className="iconbtn" title="Info"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16v-4M12 8h.01" /></svg></button>
                </div>
              </div>
              <div className="msgs" id="msgs" ref={msgsRef}>
                {rows}
                {typingNode}
              </div>
              <div className="composer">
                <div className="cbox">
                  <textarea id="ta" ref={ta} rows={1} placeholder={"Message " + (isCh ? "the team" : (threadUser ? threadUser.name.split(" ")[0] : "")) + "…"} onInput={onTaInput} onKeyDown={onTaKeyDown} />
                  <button className="send" id="send" disabled={!canSend} onClick={doSend}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg></button>
                </div>
                <div className="chint"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Real-time · <span className="kbd">Enter</span> to send · <span className="kbd">Shift+Enter</span> for a new line</div>
              </div>
            </>
          )}
        </main>
      </div>

      <div className={"menu" + (menuOpen ? " open" : "")} id="meMenu" ref={menuRef} style={{ left: menuPos.left, top: menuPos.top }}>
        <button id="themeBtn" onClick={toggleTheme}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg> Toggle theme</button>
        <button id="appBtn" onClick={() => { window.location.href = APP_HREF; }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg> Back to app</button>
      </div>
    </div>
  );
}

function Conv(props: { id: string; name: string; last: string; u: Member | null; on: boolean; online?: boolean; onClick: () => void }) {
  const { id, name, last, u, on, online, onClick } = props;
  return (
    <div className={"conv " + (on ? "on" : "")} data-c={id} onClick={onClick}>
      {u ? (
        <span className="av" style={{ width: 38, height: 38, fontSize: 14, background: u.color }}>{initials(u.name)}</span>
      ) : (
        <span className="av" style={{ width: 38, height: 38, fontSize: 16, background: "var(--brand-tint)", color: "var(--brand)" }}>#</span>
      )}
      {u ? <span className={"pres " + (online ? "online" : "")} /> : null}
      <span className="tx">
        <span className="nm"><span className="nmtxt">{name}</span>{u ? <span className="role-pill">{u.role}</span> : null}</span>
        <span className="last">{last}</span>
      </span>
    </div>
  );
}
