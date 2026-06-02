/* dash-data.jsx, realistic data for the role-dispatched dashboards (Group C) */

const DASH = {
  user: { name: "Avery", greeting: "Good morning" },

  /* ---------- C1 Recruiter ---------- */
  recruiter: {
    kpis: [
      { id: "new", label: "New today", value: 47, suffix: "", delta: +12, good: true, spark: [22,28,25,31,34,29,38,47], icon: "users" },
      { id: "sched", label: "To schedule", value: 9, delta: -2, good: true, spark: [14,13,15,12,11,12,10,9], icon: "calendar" },
      { id: "reqs", label: "My requisitions", value: 14, delta: +1, good: true, spark: [11,11,12,12,13,13,14,14], icon: "briefcase" },
      { id: "pipe", label: "In my pipeline", value: 312, delta: +34, good: true, spark: [240,255,268,274,289,295,304,312], icon: "radar" },
    ],
    applications: [
      { n: "Priya Raman", role: "Sr. Backend Engineer", src: "Referral", score: 78, st: "review", t: "8m" },
      { n: "Lena Whitfield", role: "Sr. Backend Engineer", src: "LinkedIn", score: 81, st: "pass", t: "22m" },
      { n: "Carlos Mendez", role: "Growth Marketing Lead", src: "Job board", score: 64, st: "review", t: "41m" },
      { n: "Yuki Tanaka", role: "Platform Engineer", src: "Referral", score: 88, st: "pass", t: "1h" },
      { n: "Aisha Bello", role: "Sr. Backend Engineer", src: "Inbound", score: 73, st: "review", t: "2h" },
    ],
    scheduling: [
      { n: "Dana Osei", role: "Platform Engineer", round: "Technical loop", urgent: true },
      { n: "Marcus Bell", role: "Staff Designer", round: "Final panel", urgent: false },
      { n: "Tomas Reyes", role: "Data Engineer", round: "Phone screen", urgent: false },
    ],
    myReqs: [
      { title: "Senior Backend Engineer", dept: "Payments", cand: 42, stagePct: [60, 25, 10, 5] },
      { title: "Growth Marketing Lead", dept: "Marketing", cand: 28, stagePct: [70, 18, 8, 4] },
      { title: "Platform Engineer", dept: "Infrastructure", cand: 31, stagePct: [55, 28, 12, 5] },
    ],
  },

  /* ---------- C2 Hiring manager ---------- */
  hm: {
    kpis: [
      { id: "reqs", label: "My open reqs", value: 6, delta: 0, good: true, spark: [6,6,7,6,6,6,6,6], icon: "briefcase" },
      { id: "head", label: "Open headcount", value: 11, delta: +2, good: true, spark: [8,8,9,9,10,10,11,11], icon: "users" },
      { id: "dec", label: "Decisions due", value: 4, delta: +2, good: false, spark: [1,2,2,3,2,3,4,4], icon: "gavel" },
      { id: "conv", label: "Offer→accept", value: 82, suffix: "%", delta: +3, good: true, spark: [74,76,77,79,80,80,81,82], icon: "chart" },
    ],
    decisions: [
      { n: "Marcus Bell", role: "Staff Product Designer", rec: "Hire", recAi: true, by: "Panel · 4 interviews", wait: "2d", tone: "ok" },
      { n: "Priya Raman", role: "Senior Backend Engineer", rec: "Human review", recAi: true, by: "Screening · confidence 0.61", wait: "4h", tone: "warn" },
      { n: "Sofia Karim", role: "Platform Engineer", rec: "Offer approval", recAi: false, by: "$182k base · above midpoint", wait: "6h", tone: "warn" },
      { n: "Noah Frye", role: "Data Engineer", rec: "Hire", recAi: false, by: "Panel · 3 interviews", wait: "1d", tone: "ok" },
    ],
    reqs: [
      { title: "Staff Product Designer", funnel: [120, 38, 12, 3], target: "Jun 30", risk: "on-track" },
      { title: "Platform Engineer", funnel: [98, 31, 9, 2], target: "Jun 15", risk: "at-risk" },
      { title: "Data Engineer", funnel: [76, 22, 6, 1], target: "Jul 12", risk: "on-track" },
    ],
  },

  /* ---------- C3 Interviewer ---------- */
  interviewer: {
    kpis: [
      { id: "today", label: "Today", value: 3, delta: 0, good: true, spark: [2,3,1,4,2,3,2,3], icon: "calendar" },
      { id: "fb", label: "Feedback due", value: 2, delta: -1, good: true, spark: [4,3,3,2,3,2,2,2], icon: "fileText" },
      { id: "up", label: "Upcoming (7d)", value: 5, delta: +1, good: true, spark: [3,4,4,5,4,5,5,5], icon: "clock" },
      { id: "assigned", label: "Assigned", value: 12, delta: 0, good: true, spark: [10,11,11,12,12,12,12,12], icon: "listChecks" },
    ],
    today: [
      { time: "11:00", dur: "45m", n: "Dana Osei", role: "Platform Engineer", type: "Technical", panel: 3, mode: "Video", soon: true },
      { time: "14:00", dur: "60m", n: "Marcus Bell", role: "Staff Designer", type: "Portfolio", panel: 2, mode: "Onsite", soon: false },
      { time: "16:30", dur: "30m", n: "Aisha Bello", role: "Sr. Backend Eng", type: "Phone screen", panel: 1, mode: "Phone", soon: false },
    ],
    feedback: [
      { n: "Yuki Tanaka", role: "Platform Engineer", type: "System design", when: "Yesterday", overdue: false },
      { n: "Carlos Mendez", role: "Growth Marketing Lead", type: "Behavioral", when: "2 days ago", overdue: true },
    ],
  },

  /* ---------- C4 Admin / org-wide ---------- */
  admin: {
    kpis: [
      { id: "reqs", label: "Open reqs", value: 38, delta: +4, good: true, spark: [30,31,33,34,35,36,37,38], icon: "briefcase" },
      { id: "cand", label: "Active candidates", value: 1284, delta: +86, good: true, spark: [1050,1100,1140,1180,1205,1240,1262,1284], icon: "users" },
      { id: "tth", label: "Time-to-hire", value: 21, suffix: "d", delta: -3, good: true, spark: [30,28,27,25,24,23,22,21], icon: "clock" },
      { id: "accept", label: "Offer accept", value: 86, suffix: "%", delta: +2, good: true, spark: [78,80,79,82,83,84,85,86], icon: "fileText" },
      { id: "ai", label: "AI decisions today", value: 342, delta: +58, good: true, ai: true, spark: [180,210,240,260,290,310,330,342], icon: "sparkles" },
      { id: "comp", label: "Compliance score", value: 94, suffix: "", delta: +1, good: true, spark: [89,90,91,92,93,93,94,94], icon: "shield" },
      { id: "div", label: "Diversity index", value: 78, suffix: "", delta: +4, good: true, spark: [70,71,72,74,75,76,77,78], icon: "grid" },
      { id: "cost", label: "Cost per hire", value: 4120, prefix: "$", delta: -180, good: true, spark: [4600,4500,4420,4360,4280,4220,4180,4120], icon: "card" },
    ],
    funnel: [
      { stage: "Applied", n: 4036, color: "var(--ink-3)" },
      { stage: "Screened", n: 902, color: "var(--info)" },
      { stage: "Interview", n: 318, color: "var(--ai)" },
      { stage: "Offer", n: 64, color: "var(--brand)" },
      { stage: "Hired", n: 41, color: "var(--ok)" },
    ],
    trend: [30,29,31,28,26,27,24,23,25,22,21,21], // time-to-hire by month
    trendLabels: ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"],
    diversity: [
      { g: "Women", v: 44, color: "var(--brand)" },
      { g: "Men", v: 49, color: "var(--info)" },
      { g: "Non-binary", v: 4, color: "var(--ai)" },
      { g: "Undisclosed", v: 3, color: "var(--ink-3)" },
    ],
    activity: [
      { ic: "sparkles", ai: true, who: "candidate-screener", what: "scored 23 candidates for Payments roles", t: "2m" },
      { ic: "check", who: "Jordan Lee", what: "approved an offer for Dana Osei", t: "18m" },
      { ic: "users", who: "Avery Chen", what: "imported 412 résumés to Growth Marketing", t: "1h" },
      { ic: "gavel", who: "Sam Okafor", what: "moved 6 candidates to Interview", t: "2h" },
      { ic: "shield", ai: true, who: "bias-auditor", what: "flagged an adverse-impact ratio of 0.69", t: "3h" },
    ],
    pending: [
      { ic: "gavel", title: "3 offers awaiting approval", meta: "Hiring managers · oldest 2d", tone: "warn" },
      { ic: "listChecks", title: "9 AI checkpoints in review queue", meta: "2 overdue SLAs", tone: "danger", ai: true },
      { ic: "shield", title: "2 open bias alerts", meta: "Compliance review", tone: "danger" },
      { ic: "card", title: "Plan at 64% of résumé quota", meta: "3,180 / 5,000 this month", tone: "ok" },
    ],
  },

  /* ---------- C5 Compliance officer ---------- */
  compliance: {
    kpis: [
      { id: "score", label: "Compliance score", value: 94, delta: +1, good: true, spark: [89,90,91,92,93,93,94,94], icon: "shield" },
      { id: "alerts", label: "Open bias alerts", value: 2, delta: +2, good: false, spark: [0,0,1,1,1,2,2,2], icon: "flag" },
      { id: "audit", label: "Audit events (24h)", value: 1240, delta: +110, good: true, spark: [980,1010,1080,1120,1160,1190,1220,1240], icon: "scroll" },
      { id: "models", label: "Models monitored", value: 15, delta: 0, good: true, ai: true, spark: [15,15,15,15,15,15,15,15], icon: "cpu" },
    ],
    alerts: [
      { sev: "High", attr: "Race / ethnicity", stage: "Application → Phone screen", ratio: 0.69, t: "3h ago" },
      { sev: "Medium", attr: "Age (40+)", stage: "Application → Phone screen", ratio: 0.79, t: "3h ago" },
    ],
    models: [
      { n: "candidate-screener", drift: "stable", acc: 0.93, runs: "12.4k" },
      { n: "jd-author", drift: "stable", acc: 0.96, runs: "3.1k" },
      { n: "bias-auditor", drift: "watch", acc: 0.91, runs: "640" },
      { n: "resume-verifier", drift: "stable", acc: 0.89, runs: "2.2k" },
      { n: "offer", drift: "stable", acc: 0.94, runs: "880" },
    ],
    policies: [
      { p: "EEOC adverse-impact monitoring", st: "active", note: "Auto-runs nightly" },
      { p: "GDPR data-retention (24 mo)", st: "active", note: "Next purge in 12d" },
      { p: "Right-to-explanation enabled", st: "active", note: "Candidate portal live" },
      { p: "Human-in-the-loop on rejections", st: "active", note: "No auto-decline" },
      { p: "Model drift alerts", st: "review", note: "1 model on watch" },
    ],
    audit: [
      { who: "bias-auditor", act: "computed four-fifths report", t: "3h", ai: true },
      { who: "Avery Chen", act: "exported EEOC summary (Q2)", t: "5h" },
      { who: "system", act: "retention purge, 1,204 records", t: "1d" },
      { who: "Jordan Lee", act: "overrode an AI rejection", t: "1d" },
    ],
  },
};

window.DASH = DASH;
