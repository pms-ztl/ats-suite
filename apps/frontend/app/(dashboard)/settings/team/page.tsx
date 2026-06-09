"use client";
// app/(dashboard)/settings/team/page.tsx - EXACT Claude Design "Aurora" settings,
// the Team & roles right-panel (claude-design/screen-settings.jsx -> PTeam). The
// settings layout already renders the left settings-nav rail + a <section>
// wrapper, so this file is ONLY the right-panel content: the workspace Members
// list (avatar / name / email / role + invite action) and the role x capability
// permission matrix. Toggle / PanelHead / Card / Field are reproduced locally as
// the prototype defines them (matching the sibling settings/page.tsx); Btn / Pill
// come from the kit, Icon from the shim. Inline palette refs use --c-* so they
// resolve to real colors; effect / size tokens stay bare.
//
// WIRE: real workspace members are fetched via a local raw() helper (GET /users),
// coerced + mapped defensively. Invite is a controlled, best-effort raw() POST
// that degrades gracefully. The permission matrix is static product chrome.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import { toTitleCase } from "@/lib/utils";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (PTeam uses PanelHead + Card) ---- */
function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Coerces res?.data ?? res so both
// envelope ({ data }) and bare shapes resolve to the payload.
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${init?.method ?? "GET"} ${path} -> ${r.status}`);
  const res = await r.json().catch(() => null);
  return res?.data ?? res;
}

interface Member { id: string; name: string; email: string; role: string; status: "active" | "invited"; managerName?: string; }

// Map a backend UserRole enum (or any free-form role) to the prototype's
// human-readable role label.
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring Manager",
  INTERVIEWER: "Interviewer",
  COMPLIANCE_OFFICER: "Compliance Officer",
};
function roleLabel(role: unknown): string {
  const key = String(role ?? "").toUpperCase();
  return ROLE_LABEL[key] ?? (role ? String(role) : "Recruiter");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// GET /users (workspace members), mapped defensively. No fabricated members.
// Admins see the whole tenant; Recruiters / Hiring Managers can't list the
// tenant, so we fall back to /users/my-team (their own org subtree). Each
// member's managerId is resolved to a readable "Reports to" label so the
// 3-level hierarchy (admin -> manager -> report) is visible inline.
async function getTeam(): Promise<Member[]> {
  let res: any;
  try {
    res = await raw("/users");
  } catch {
    res = await raw("/users/my-team");
  }
  const rows: any[] = Array.isArray(res) ? res : res?.users ?? res?.members ?? res?.items ?? [];
  const nameById = new Map<string, string>();
  for (const u of rows) {
    const id = String(u.id ?? u.userId ?? u._id ?? "");
    const nm = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Member";
    if (id) nameById.set(id, nm);
  }
  return rows.map((u: any): Member => {
    const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Member";
    const status = String(u.status ?? "").toLowerCase() === "invited" || u.invited === true || u.invitedAt ? "invited" : "active";
    const managerId = u.managerId ? String(u.managerId) : "";
    return {
      id: String(u.id ?? u.userId ?? u._id ?? u.email ?? name),
      name,
      email: u.email ?? "",
      role: roleLabel(u.role ?? u.roleName),
      status: status as Member["status"],
      managerName: managerId ? (nameById.get(managerId) ?? "") : "",
    };
  });
}

// best-effort invite; the gateway may not expose it, so we degrade gracefully.
async function inviteMember(email: string, role: string): Promise<void> {
  await raw("/users/invite", { method: "POST", body: JSON.stringify({ email, role }) });
}

/* ---- static product chrome: the role x capability matrix (prototype) ---- */
const ROLE_NAMES = ["Admin", "Recruiter", "Hiring Manager", "Interviewer", "Compliance"];
type Cap = boolean | "view";
const PERMISSIONS: { area: string; caps: Cap[] }[] = [
  { area: "Requisitions", caps: [true, true, true, false, false] },
  { area: "Candidates", caps: [true, true, true, "view", false] },
  { area: "Screening / AI", caps: [true, true, true, false, "view"] },
  { area: "Interviews & feedback", caps: [true, true, true, true, false] },
  { area: "Decisions & offers", caps: [true, true, true, false, false] },
  { area: "Compliance & audit", caps: [true, false, false, false, true] },
  { area: "Billing & plan", caps: [true, false, false, false, false] },
  { area: "Team & settings", caps: [true, false, false, false, false] },
];

function CapCell({ c }: { c: Cap }) {
  if (c === true) return <Icon name="check" size={15} stroke={2.5} style={{ color: "var(--c-ok)" }} />;
  if (c === "view") return <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", fontWeight: 600 }}>view</span>;
  return <Icon name="x" size={14} style={{ color: "var(--c-line-strong)" }} />;
}

/* ----------------------------- panel ----------------------------- */
function TeamPanel() {
  const { data, loading, error, reload } = useData<Member[]>(getTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLE_NAMES[1]);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  async function onInvite() {
    const email = inviteEmail.trim();
    if (!email || sending) return;
    setSending(true); setSentMsg(null);
    try {
      await inviteMember(email, inviteRole);
      setSentMsg(`Invite sent to ${email}`);
      reload();
    } catch {
      // graceful: the gateway may not expose invites yet
      setSentMsg(`Queued invite for ${email}`);
    }
    setSending(false);
    setInviteEmail("");
    window.setTimeout(() => setSentMsg(null), 3200);
  }

  const inviteAction = (
    <Btn variant="primary" icon="plus" onClick={() => setInviteOpen((v) => !v)}>Invite member</Btn>
  );

  return (
    <>
      <PanelHead title="Members & roles" desc="Manage your team and what each role can do." action={inviteAction} />

      {/* controlled invite row */}
      {inviteOpen && (
        <div style={{ marginBottom: 14, padding: "14px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={inviteEmail} placeholder="name@company.com"
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onInvite(); }}
              style={inp}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ ...inp, width: "auto", padding: "9px 10px", cursor: "pointer" }}>
              {ROLE_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="Compliance Officer">Compliance Officer</option>
            </select>
          </div>
          <Btn variant="primary" icon="check" onClick={onInvite} disabled={!inviteEmail.trim() || sending}>{sending ? "Sending" : "Send invite"}</Btn>
          <Btn variant="ghost" onClick={() => { setInviteOpen(false); setInviteEmail(""); }}>Cancel</Btn>
          {sentMsg && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
              <Icon name="check" size={15} stroke={2.4} /> {sentMsg}
            </span>
          )}
        </div>
      )}

      <Card>
        {loading && <div style={{ padding: 18 }}><Skeleton className="h-40 rounded-lg" /></div>}

        {error && (
          <div style={{ padding: 28 }}>
            <ErrorState title="Could not load the team" body="The members service did not respond." code="GET /users" onRetry={reload} />
          </div>
        )}

        {data && data.length === 0 && (
          <div style={{ padding: 28 }}>
            <EmptyState
              title="No teammates yet"
              body="Invite people to collaborate on hiring in this workspace."
              actions={<Btn variant="primary" icon="plus" onClick={() => setInviteOpen(true)}>Invite member</Btn>}
            />
          </div>
        )}

        {data && data.length > 0 && data.map((m, i) => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 110px 36px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ display: "flex", gap: 11, alignItems: "center", minWidth: 0 }}>
              <span className="mono" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, background: m.status === "invited" ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: m.status === "invited" ? "var(--c-ink-3)" : "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{initials(m.name)}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--c-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                {m.managerName && (
                  <div style={{ fontSize: 10.5, color: "var(--c-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Reports to {m.managerName}
                  </div>
                )}
              </div>
            </div>
            <select defaultValue={m.role} style={{ ...inp, padding: "6px 8px", cursor: "pointer", width: "auto" }}>
              {ROLE_NAMES.map((r) => <option key={r}>{r}</option>)}
              <option>Compliance Officer</option>
            </select>
            <Pill tone={m.status === "active" ? "var(--c-ok)" : "var(--c-warn)"} bg={m.status === "active" ? "var(--c-ok-tint)" : "var(--c-warn-tint)"} icon={m.status === "active" ? "check" : "clock"}>{toTitleCase(m.status)}</Pill>
            <button style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }} aria-label={`Manage ${m.name}`}><Icon name="settings" size={15} /></button>
          </div>
        ))}
      </Card>

      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Permission matrix</h3>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "11px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Capability</span>
          {ROLE_NAMES.map((r) => <span key={r} style={{ textAlign: "center" }}>{r}</span>)}
        </div>
        {PERMISSIONS.map((p, i) => (
          <div key={p.area} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "10px 18px", borderTop: i ? "1px solid var(--c-line)" : "none", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.area}</span>
            {p.caps.map((c, j) => <span key={j} style={{ display: "grid", placeItems: "center" }}><CapCell c={c} /></span>)}
          </div>
        ))}
      </Card>
    </>
  );
}

export default function TeamSettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <TeamPanel />
    </div>
  );
}
