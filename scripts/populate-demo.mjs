// Populate the demo with RICH, REAL data extracted from the local sample
// resumes (samples/normal/*.pdf). No LLM calls — pdf-parse extracts the text
// locally, then we keyword-match skills, pull contact/location, and create
// candidates + applications spread across the hiring pipeline via the gateway.
//
//   node scripts/populate-demo.mjs
//
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
// pdf-parse v2 — class-based API (PDFParse), per apps/resume-service/src/lib/extract.ts
const pdfMod = await import("pdf-parse");
const PDFParse = pdfMod.PDFParse ?? pdfMod.default?.PDFParse;
async function pdfText(buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try { const r = await parser.getText(); return r?.text ?? ""; }
  finally { await parser.destroy?.(); }
}

const API = "http://localhost:4000/api";
const SAMPLES = "D:/CDC/ATS/samples/normal";

const SKILL_BANK = [
  "Python", "TypeScript", "JavaScript", "Go", "Rust", "Java", "C++", "C#", "Ruby", "PHP", "Scala", "Kotlin", "Swift",
  "React", "Angular", "Vue", "Next.js", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Rails",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Kafka", "RabbitMQ", "Elasticsearch",
  "Kubernetes", "Docker", "Terraform", "Ansible", "Helm", "AWS", "GCP", "Azure", "Lambda",
  "PyTorch", "TensorFlow", "Keras", "scikit-learn", "Pandas", "NumPy", "Spark", "Hadoop", "Airflow", "dbt", "Snowflake",
  "GraphQL", "gRPC", "REST", "Microservices", "CI/CD", "Jenkins", "GitHub Actions", "GitLab",
  "Prometheus", "Grafana", "Datadog", "Figma", "Sketch", "Tableau", "Power BI", "Looker",
  "SQL", "NoSQL", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "LLM", "Data Engineering",
  "DevOps", "SRE", "Linux", "Bash", "Git", "Agile", "Scrum",
];
const CITIES = [
  "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Denver, CO", "Chicago, IL",
  "Bangalore, IN", "Mumbai, IN", "Hyderabad, IN", "London, UK", "Berlin, DE", "Toronto, CA", "Remote",
];
const SOURCES = ["LinkedIn", "Referral", "Job board", "Company website", "Recruiter outreach", "Indeed", "GitHub Jobs"];
// Funnel-weighted: more candidates early in the pipeline, fewer near offer.
const STAGES = ["APPLIED", "APPLIED", "APPLIED", "SCREENED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "INTERVIEW", "FINAL_REVIEW", "OFFER"];

let seed = 20260608;
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function sample(a, n) { const o = [], u = new Set(); while (o.length < n && u.size < a.length) { const i = Math.floor(rnd() * a.length); if (!u.has(i)) { u.add(i); o.push(a[i]); } } return o; }

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

function nameFromFile(fn) {
  const m = fn.match(/^resume_\d+_(.+)\.pdf$/i);
  const raw = m ? m[1] : fn.replace(/\.pdf$/i, "");
  const parts = raw.split("_").filter(Boolean);
  return { first: parts[0] ?? "Unknown", last: parts.slice(1).join(" ") || "Candidate" };
}
function extractSkills(text) {
  const low = text.toLowerCase(), found = [];
  for (const s of SKILL_BANK) {
    const esc = s.toLowerCase().replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(low)) found.push(s);
  }
  return [...new Set(found)];
}
function extractLocation(text) { for (const c of CITIES) { if (c !== "Remote" && text.includes(c.split(",")[0])) return c; } return null; }
function extractPhone(text) { return text.match(/(\+?\d[\d\s().-]{8,}\d)/)?.[0]?.trim().slice(0, 20) ?? null; }

async function main() {
  const token = (await api("POST", "/auth/login", null, { email: "priya@pinnacle.demo", password: "PinnacleDemo123!" })).token;
  console.log("logged in as priya");

  const existResp = await api("GET", "/candidates?page=1&pageSize=400", token);
  const existNames = new Set((existResp.data ?? existResp).map((c) => (c.name ?? `${c.firstName} ${c.lastName}`).toLowerCase().trim()));
  console.log("existing candidates:", existNames.size);

  // Enrich the job set so candidates spread across more roles.
  const reqResp = await api("GET", "/requisitions?page=1&pageSize=50", token);
  const reqs = (reqResp.data ?? reqResp).map((r) => r.id);
  const EXTRA = [
    { title: "Senior Backend Engineer", department: "Engineering", requirements: ["Go", "PostgreSQL", "Kubernetes", "Distributed systems"], salaryMin: 180000, salaryMax: 240000 },
    { title: "Staff ML Engineer", department: "Applied AI", requirements: ["PyTorch", "MLOps", "Python", "Distributed training"], salaryMin: 220000, salaryMax: 300000 },
    { title: "Product Manager, Growth", department: "Product", requirements: ["SQL", "Analytics", "A/B testing"], salaryMin: 150000, salaryMax: 200000 },
    { title: "Senior Frontend Engineer", department: "Engineering", requirements: ["React", "TypeScript", "Node.js"], salaryMin: 160000, salaryMax: 210000 },
    { title: "Data Engineer", department: "Data", requirements: ["Spark", "Airflow", "dbt", "Snowflake"], salaryMin: 160000, salaryMax: 215000 },
  ];
  for (const r of EXTRA) {
    try { const c = await api("POST", "/requisitions", token, { ...r, location: pick(["Remote", "Hybrid (NYC)", "Hybrid (SF)"]), status: "OPEN" }); reqs.push(c.id); }
    catch (e) { console.log("  ! req", r.title, e.message.slice(0, 60)); }
  }
  console.log("requisitions available:", reqs.length);

  const files = readdirSync(SAMPLES).filter((f) => f.toLowerCase().endsWith(".pdf")).sort();
  let created = 0, skipped = 0, apps = 0, idx = 0;
  for (const fn of files) {
    idx++;
    const { first, last } = nameFromFile(fn);
    const full = `${first} ${last}`.toLowerCase().trim();
    if (existNames.has(full)) { skipped++; continue; }
    let text = "";
    try { text = await pdfText(readFileSync(join(SAMPLES, fn))); } catch { /* image-only */ }
    let skills = extractSkills(text);
    if (skills.length === 0) skills = sample(SKILL_BANK, 5);
    if (skills.length > 14) skills = skills.slice(0, 14);
    const email = `${first}.${last}.r${String(idx).padStart(2, "0")}@example.com`.toLowerCase().replace(/\s+/g, "");
    try {
      const cand = await api("POST", "/candidates", token, {
        email, firstName: first, lastName: last,
        phone: extractPhone(text) ?? `+1${String(2000000000 + Math.floor(rnd() * 7000000000)).slice(0, 10)}`,
        location: extractLocation(text) ?? pick(CITIES),
        source: pick(SOURCES),
        tags: skills,
      });
      created++; existNames.add(full);
      try { await api("POST", "/applications", token, { candidateId: cand.id, requisitionId: pick(reqs), stage: pick(STAGES), status: "ACTIVE" }); apps++; }
      catch (e) { if (idx <= 3) console.log("  ! app", full, e.message.slice(0, 80)); }
    } catch (e) { console.log("  ! cand", full, e.message.slice(0, 80)); }
  }
  console.log(`\nDONE: created ${created} candidates, ${apps} applications, skipped ${skipped} (already existed).`);
}
main().catch((e) => { console.error(e); process.exit(1); });
