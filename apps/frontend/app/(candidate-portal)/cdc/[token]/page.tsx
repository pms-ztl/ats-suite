"use client";
// Module A — CDC / college share landing. A Career Development Centre shares this
// link with students; it lists the company's open roles and routes each apply
// through the canonical apply page with the college name stamped (?college=), so
// every resume arrives WITH the college attached.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Posting {
  id: string; slug: string; title: string;
  requisition?: { title?: string; department?: string; location?: string; salaryMin?: number; salaryMax?: number; salaryCurrency?: string };
}
interface Data { college: { id: string; name: string }; postings: Posting[] }

export default function CdcLandingPage() {
  const params = useParams();
  const token = String(params?.["token"] ?? "");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/public/cdc/${token}`, { credentials: "include" });
        if (!r.ok) { setError("This campus link is invalid or has been revoked."); return; }
        const d = await r.json();
        setData(d?.data ?? d);
      } catch { setError("Could not load the campus job board."); }
    })();
  }, [token]);

  if (error) return <Shell><div style={card}><h2 style={{ marginTop: 0 }}>Campus job board</h2><p style={{ color: "#555" }}>{error}</p></div></Shell>;
  if (!data) return <Shell><p style={{ color: "#555" }}>Loading roles…</p></Shell>;

  const college = encodeURIComponent(data.college.name);
  return (
    <Shell>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "#107a57", fontWeight: 700 }}>Campus hiring · {data.college.name}</div>
        <h1 style={{ margin: "6px 0 2px", fontSize: 28 }}>Open roles for {data.college.name}</h1>
        <p style={{ margin: 0, color: "#555" }}>Apply below — your application is tagged with your college automatically.</p>
      </div>
      {data.postings.length === 0 && <div style={card}><p style={{ color: "#555", margin: 0 }}>No open roles right now. Check back soon.</p></div>}
      <div style={{ display: "grid", gap: 12 }}>
        {data.postings.map((p) => {
          const r = p.requisition ?? {};
          return (
            <div key={p.id} style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{r.title ?? p.title}</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                  {[r.department, r.location].filter(Boolean).join(" · ")}
                  {typeof r.salaryMin === "number" && typeof r.salaryMax === "number" && (
                    <> · {r.salaryCurrency ?? "USD"} {Math.round(r.salaryMin / 1000)}k–{Math.round(r.salaryMax / 1000)}k</>
                  )}
                </div>
              </div>
              <a href={`/jobs/${p.slug}/apply?college=${college}`} style={{ padding: "10px 18px", borderRadius: 8, background: "#107a57", color: "#fff", fontWeight: 600, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap" }}>
                Apply
              </a>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 };
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#f6f8f7", padding: "36px 18px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
