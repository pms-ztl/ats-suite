// Schedule real interviews for candidates already sitting in interview-ish
// pipeline stages (PHONE_SCREEN / INTERVIEW / FINAL_REVIEW). Reads the live
// applications, then POSTs to the interview-service via the gateway. A slice
// of past-dated interviews get feedback so they show as Completed.
//
//   node scripts/populate-interviews.mjs
//
const API = "http://localhost:4000/api";

let seed = 424242;
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }

async function api(method, path, token, body) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = {}; try { json = JSON.parse(text); } catch { /* */ }
  if (!res.ok || json?.success === false) throw new Error(`${method} ${path} -> ${res.status}: ${(json?.error?.message ?? text).slice(0, 150)}`);
  return json?.data ?? json;
}

const PLAN = {
  PHONE_SCREEN: { label: "Phone Screen", types: ["PHONE_SCREEN"], dur: 30 },
  INTERVIEW: { label: "Technical Interview", types: ["TECHNICAL", "PANEL", "BEHAVIORAL"], dur: 60 },
  FINAL_REVIEW: { label: "Final Round", types: ["FINAL"], dur: 45 },
};
function whenISO(daysFromNow) {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  d.setHours(9 + Math.floor(rnd() * 8), pick([0, 15, 30, 45]), 0, 0);
  return d.toISOString();
}

async function main() {
  const login = await api("POST", "/auth/login", null, { email: "priya@pinnacle.demo", password: "PinnacleDemo123!" });
  const token = login.token, me = login.user;
  console.log("logged in as priya", me.id);

  const appsResp = await api("GET", "/applications?page=1&pageSize=500", token);
  const apps = (appsResp.data ?? appsResp).filter((a) => PLAN[a.stage]);
  console.log("interview-stage applications:", apps.length);

  let created = 0, completed = 0;
  for (const a of apps) {
    const plan = PLAN[a.stage];
    const days = Math.floor(rnd() * 22) - 7; // -7..+14
    const past = days < 0;
    try {
      const iv = await api("POST", "/interviews", token, {
        requisitionId: a.requisitionId,
        candidateId: a.candidateId,
        applicationId: a.id,
        stage: plan.label,
        type: pick(plan.types),
        scheduledAt: whenISO(days),
        duration: plan.dur,
      });
      created++;
      // ~half of the past-dated ones get feedback -> Completed.
      if (past && rnd() < 0.6) {
        try {
          await api("POST", `/interviews/${iv.id}/feedback`, token, {
            interviewerId: me.id,
            candidateId: a.candidateId,
            overallRating: 3 + Math.floor(rnd() * 3), // 3..5
            recommendation: pick(["STRONG_HIRE", "HIRE", "HIRE", "LEAN_HIRE", "NO_HIRE"]),
            strengths: pick([["Strong fundamentals", "Clear communicator"], ["Good system design", "Pragmatic"], ["Deep domain knowledge"]]),
            concerns: pick([[], ["Limited leadership signal"], ["Wants more scope detail"]]),
            notes: "Solid round; notes captured for the panel debrief.",
          });
          completed++;
        } catch (e) { if (completed < 2) console.log("  ! feedback", e.message.slice(0, 90)); }
      }
    } catch (e) { if (created < 3) console.log("  ! interview", e.message.slice(0, 100)); }
  }
  console.log(`\nDONE: ${created} interviews scheduled, ${completed} marked completed with feedback.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
