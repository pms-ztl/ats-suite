// Create real Offer records for candidates at/near the OFFER stage, using each
// requisition's real comp band for the base salary, with a realistic spread of
// statuses. Reads live applications + requisitions, POSTs to the new offers API.
//
//   node scripts/populate-offers.mjs
//
const API = "http://localhost:4000/api";

let seed = 909090;
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

// OFFER stage = real offers out the door; FINAL_REVIEW = offers in preparation.
const STATUS_BY_STAGE = {
  OFFER: ["SENT", "SENT", "ACCEPTED", "APPROVED", "DECLINED"],
  FINAL_REVIEW: ["DRAFT", "PENDING_APPROVAL", "DRAFT"],
};

async function main() {
  const token = (await api("POST", "/auth/login", null, { email: "priya@pinnacle.demo", password: "PinnacleDemo123!" })).token;
  console.log("logged in as priya");

  const reqResp = await api("GET", "/requisitions?page=1&pageSize=50", token);
  const salById = new Map((reqResp.data ?? reqResp).map((r) => [r.id, { min: r.salaryMin ?? 120000, max: r.salaryMax ?? 180000 }]));

  const appsResp = await api("GET", "/applications?page=1&pageSize=500", token);
  const apps = (appsResp.data ?? appsResp);

  let created = 0;
  const byStatus = {};
  for (const a of apps) {
    const statuses = STATUS_BY_STAGE[a.stage];
    if (!statuses) continue;
    if (a.stage === "FINAL_REVIEW" && rnd() > 0.6) continue; // only some FINAL_REVIEW get a draft offer
    const sal = salById.get(a.requisitionId) ?? { min: 120000, max: 180000 };
    const base = Math.round((sal.min + rnd() * (sal.max - sal.min)) / 1000) * 1000;
    const status = pick(statuses);
    const equity = pick(["0.05%", "0.1%", "0.15%", "0.25%", null]);
    try {
      await api("POST", "/offers", token, {
        candidateId: a.candidateId,
        requisitionId: a.requisitionId,
        applicationId: a.id,
        baseSalary: base,
        currency: "USD",
        bonusPercent: pick([0, 10, 10, 15, 20]),
        ...(equity ? { equity } : {}),
        startDate: new Date(Date.now() + (21 + Math.floor(rnd() * 40)) * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        status,
        notes: "Offer prepared from the approved comp band.",
      });
      created++;
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    } catch (e) { if (created < 3) console.log("  ! offer", e.message.slice(0, 100)); }
  }
  console.log(`\nDONE: created ${created} offers`);
  console.log("  by status:", JSON.stringify(byStatus));
}
main().catch((e) => { console.error(e); process.exit(1); });
