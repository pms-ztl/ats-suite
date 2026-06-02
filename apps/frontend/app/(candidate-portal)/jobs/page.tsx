"use client";

// Candidate-portal job board, ported from claude-design/portal.jsx (JobBoard).
// CandidateLayout (components/layouts/candidate-layout.tsx) provides the outer
// nav, footer and the max-w-5xl <main> wrapper, so this file renders ONLY the
// page content: hero + search, the AI-advisory notice, and the jobs grid.
// Real jobs are fetched inline (raw() below); no fabricated listings.

import { useEffect, useMemo, useState } from "react";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";

/* ---- local icons (prototype subset, names not in aurora-icon) ---- */
const PI: Record<string, string> = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  heart:
    "M12 20s-7-4.5-9.2-9C1.4 8.2 2.6 5 5.6 5c1.9 0 3.1 1.2 3.9 2.3C10.3 6.2 11.5 5 13.4 5c3 0 4.2 3.2 2.8 6-2.2 4.5-9.2 9-9.2 9z",
  briefcase:
    "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
};
function I({
  n,
  s = 20,
  sw = 1.7,
  c,
  style,
}: {
  n: string;
  s?: number;
  sw?: number;
  c?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c || "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      <path d={PI[n]} />
    </svg>
  );
}

/* ---- portal-local primitives (Btn / Chip / AINotice from the prototype) ---- */
function Btn({
  kind = "primary",
  icon,
  trail,
  children,
  onClick,
  type = "button",
  big,
  full,
  style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string;
  trail?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  big?: boolean;
  full?: boolean;
  style?: React.CSSProperties;
}) {
  const V: Record<string, React.CSSProperties> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-brand)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        padding: big ? "13px 22px" : "10px 18px",
        fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700,
        borderRadius: "var(--r)",
        cursor: "pointer",
        border: "1px solid transparent",
        width: full ? "100%" : "auto",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V[kind],
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
    >
      {icon && <I n={icon} s={big ? 19 : 17} />}
      {children}
      {trail && <I n={trail} s={big ? 19 : 17} />}
    </button>
  );
}

function Chip({
  icon,
  children,
  tone = "var(--c-ink-2)",
  bg = "var(--c-surface-2)",
}: {
  icon?: string;
  children?: React.ReactNode;
  tone?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: "var(--r-pill)",
        fontSize: "var(--fs-xs)",
        fontWeight: 600,
        color: tone,
        background: bg,
      }}
    >
      {icon && <I n={icon} s={13} />}
      {children}
    </span>
  );
}

/* AI-assistive banner, appears wherever AI touches the candidate. */
function AINotice({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: compact ? "center" : "flex-start",
        padding: compact ? "11px 14px" : "16px 18px",
        borderRadius: "var(--r-lg)",
        background: "var(--c-ai-tint)",
        border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--c-ai)",
          color: "var(--c-on-brand)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <I n="sparkles" s={17} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>
          AI is assistive, a human decides.
        </div>
        {!compact && (
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
            We use AI to help our team review applications fairly. It produces a recommendation only, a
            person always makes the final call, and you can ask for a human review at any time.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- inline data fetch (DO NOT edit lib/api.ts) ---- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try {
    t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/** Normalized shape used by the card grid. */
interface PortalJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
}

/** Defensive map of an unknown payload row into a PortalJob. */
function toJob(row: unknown, idx: number): PortalJob | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const req = (r.requisition && typeof r.requisition === "object" ? r.requisition : {}) as Record<
    string,
    unknown
  >;
  const pick = (...vals: unknown[]) => {
    for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
    return "";
  };
  const id = pick(r.id, r.slug, req.id, String(idx));
  const title = pick(r.title, r.name, req.title);
  if (!title) return null;
  return {
    id: id || String(idx),
    title,
    department: pick(r.department, req.department, r.team) || "General",
    location: pick(r.location, req.location, r.locationName) || "Location flexible",
    type: pick(r.type, r.employmentType, req.employmentType, r.workType) || "Full-time",
  };
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<PortalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      // Try the candidate-facing endpoints in order; first success wins.
      const endpoints = ["/jobs", "/public/jobs", "/requisitions?status=OPEN"];
      let lastErr: unknown = null;

      for (const ep of endpoints) {
        try {
          const res = await raw(ep);
          const arr: unknown[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          const mapped = arr.map(toJob).filter((j): j is PortalJob => j !== null);
          if (!cancelled) {
            setJobs(mapped);
            setLoading(false);
          }
          return;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!cancelled) {
        setError(lastErr instanceof Error ? lastErr.message : "Unable to load roles");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter((j) =>
      (j.title + j.department + j.location + j.type).toLowerCase().includes(term)
    );
  }, [jobs, q]);

  function retry() {
    // Re-run the effect by toggling a fresh load.
    setJobs([]);
    setLoading(true);
    setError(null);
    const endpoints = ["/jobs", "/public/jobs", "/requisitions?status=OPEN"];
    (async () => {
      let lastErr: unknown = null;
      for (const ep of endpoints) {
        try {
          const res = await raw(ep);
          const arr: unknown[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setJobs(arr.map(toJob).filter((j): j is PortalJob => j !== null));
          setLoading(false);
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      setError(lastErr instanceof Error ? lastErr.message : "Unable to load roles");
      setLoading(false);
    })();
  }

  const countLabel = loading
    ? "Loading roles"
    : `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}`;

  return (
    <div style={{ animation: "rise .4s var(--ease-out)" }}>
      {/* hero */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 0 28px", textAlign: "center" }}>
        <Chip icon="heart" tone="var(--c-brand)" bg="var(--c-brand-tint)">
          {`We're hiring`} · {countLabel}
        </Chip>
        <h1
          style={{
            fontSize: "var(--fs-4xl)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: "18px 0 0",
            textWrap: "balance",
          }}
        >
          Find your next opportunity.
        </h1>
        <p
          style={{
            fontSize: "var(--fs-lg)",
            color: "var(--c-ink-2)",
            maxWidth: 560,
            margin: "16px auto 0",
            lineHeight: 1.5,
          }}
        >
          Join a team building hiring tools that are fast, fair, and a genuine pleasure to use. Every
          application gets a human{`'`}s attention.
        </p>
        <div
          style={{
            maxWidth: 460,
            margin: "26px auto 0",
            display: "flex",
            gap: 10,
            alignItems: "center",
            padding: "7px 7px 7px 16px",
            borderRadius: "var(--r-pill)",
            background: "var(--c-surface)",
            border: "1px solid var(--c-line-2)",
            boxShadow: "var(--e2)",
          }}
        >
          <I n="search" s={19} c="var(--c-ink-3)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search roles, teams, locations..."
            aria-label="Search roles, teams, locations"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "var(--fs-md)",
              color: "var(--c-ink)",
            }}
          />
          <Btn kind="primary">Search</Btn>
        </div>
      </div>

      {/* AI advisory */}
      <div style={{ maxWidth: 1080, margin: "0 auto 18px" }}>
        <AINotice />
      </div>

      {/* jobs */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 0 20px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--c-line)",
                  background: "var(--c-surface)",
                  borderRadius: "var(--r-xl)",
                  padding: 22,
                  boxShadow: "var(--e1)",
                }}
              >
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <Skeleton className="mt-5 h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ display: "grid", placeItems: "center", padding: "40px 0" }}>
            <ErrorState
              title="We could not load open roles"
              body="Something went wrong reaching the careers service. Please try again in a moment."
              code={error}
              onRetry={retry}
            />
          </div>
        ) : list.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", padding: "40px 0" }}>
            <EmptyState
              illustration={
                <span
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--r-lg)",
                    background: "var(--c-surface-2)",
                    color: "var(--c-ink-3)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <I n="briefcase" s={26} />
                </span>
              }
              title={q ? "No roles match your search" : "No open roles right now"}
              body={
                q
                  ? "Try a different title, team, or location."
                  : "There are no published openings at the moment. Please check back soon."
              }
              actions={
                q ? (
                  <Btn kind="soft" onClick={() => setQ("")}>
                    Clear search
                  </Btn>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {list.map((j, i) => (
              <a
                key={j.id}
                href={`/jobs/${j.id}/apply`}
                style={{
                  display: "block",
                  textAlign: "left",
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                  border: "1px solid var(--c-line)",
                  background: "var(--c-surface)",
                  borderRadius: "var(--r-xl)",
                  padding: 22,
                  boxShadow: "var(--e1)",
                  transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
                  animation: "rise .4s var(--ease-out) both",
                  animationDelay: i * 50 + "ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "var(--e2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--e1)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <Chip icon="briefcase">{j.department}</Chip>
                    <Chip icon="clock" tone="var(--c-brand)" bg="var(--c-brand-tint)">
                      {j.type}
                    </Chip>
                  </div>
                  <I n="arrow" s={18} c="var(--c-ink-3)" />
                </div>
                <h3
                  style={{
                    fontSize: "var(--fs-xl)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: "14px 0 6px",
                  }}
                >
                  {j.title}
                </h3>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <Chip icon="pin">{j.location}</Chip>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
