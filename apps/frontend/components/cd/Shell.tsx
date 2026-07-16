"use client";
// components/Shell.tsx
// The global app shell, ported pixel-exact from shell.jsx: collapsible/resizable
// sidebar with org switcher + plan badge + role-gated nav + plan-usage footer, the
// glass top bar with breadcrumb, command-K search, notifications, theme toggle and
// user menu, the command palette, notifications panel, and the super-admin safety
// banner. Data comes in via props; collapse / active / theme / palette / drawer are
// internal state. No fetching, no hardcoded data.
import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { flushSync } from "react-dom";
import { Icon, Logo, type IconName } from "./icon";
import { Pill } from "./aurora-kit";
import type {
  ShellUser, Workspace, NavSection, PlanUsage, NotifGroup, CommandGroup, RoleMeta,
} from "./types";

/* ---------------- hooks ---------------- */
function useTheme(onChange?: (t: string) => void): [string, (e?: React.MouseEvent) => void] {
  const [theme, setTheme] = useState<string>(() => (typeof localStorage !== "undefined" && localStorage.getItem("cdc-theme")) || "light");
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("cdc-theme", theme); } catch {} onChange?.(theme); }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (e?: React.MouseEvent) => {
    const next = theme === "dark" ? "light" : "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svt = (document as any).startViewTransition;
    if (!svt || reduce) { setTheme(next); return; }
    const x = e ? e.clientX : innerWidth - 80, y = e ? e.clientY : 40;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = svt.call(document, () => { flushSync(() => setTheme(next)); });
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 480, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };
  return [theme, toggle];
}

function useClickOutside(ref: React.RefObject<HTMLElement>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useVP() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return w;
}

/* ---------------- Org / workspace switcher ---------------- */
function OrgSwitcher({ ws, workspaces, roles, onPick, collapsed }: {
  ws: Workspace; workspaces: Workspace[]; roles: Record<string, RoleMeta>; onPick: (w: Workspace) => void; collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "0" : "8px 9px",
        background: open ? "var(--surface-2)" : "transparent", border: "1px solid", borderColor: open ? "var(--line-2)" : "transparent",
        borderRadius: "var(--r-lg)", cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start", transition: "background var(--t), border-color var(--t)",
      }}>
        <div className="mono" style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", background: "color-mix(in oklab, " + ws.color + " 16%, var(--surface))", color: ws.color, fontWeight: 700, fontSize: 13, border: "1px solid color-mix(in oklab, " + ws.color + " 24%, transparent)" }}>{ws.initials}</div>
        {!collapsed && <>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em", color: ws.planTone, background: ws.planBg, padding: "1px 6px", borderRadius: 5 }}>{ws.plan}</span>
            </div>
          </div>
          <Icon name="chevExpand" size={15} style={{ color: "var(--ink-3)" }} />
        </>}
      </button>
      {open && (
        <div className="glass" style={{ position: "absolute", top: collapsed ? 44 : "calc(100% + 6px)", left: 0, width: 286, zIndex: 60, borderRadius: "var(--r-lg)", padding: 6, animation: "pop .16s var(--ease-out)" }}>
          <div style={{ padding: "7px 9px 5px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--ink-3)" }}>Workspaces</div>
          {workspaces.map((w) => {
            const active = w.id === ws.id;
            return (
              <button key={w.id} onClick={() => { onPick(w); setOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: "var(--r)", border: "none", cursor: "pointer", background: active ? "var(--brand-tint)" : "transparent", textAlign: "left", transition: "background var(--t-fast)" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <div className="mono" style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "color-mix(in oklab, " + w.color + " 16%, var(--surface))", color: w.color, fontWeight: 700, fontSize: 12 }}>{w.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 1 }}>
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{roles[w.role]?.label ?? w.role}</span>
                    {w.invites ? <span style={{ fontSize: 10, fontWeight: 700, color: "var(--warn)", background: "var(--warn-tint)", padding: "0 5px", borderRadius: 5 }}>{w.invites} invite{w.invites > 1 ? "s" : ""}</span> : null}
                  </div>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: w.planTone, background: w.planBg, padding: "1px 6px", borderRadius: 5 }}>{w.plan}</span>
                {active && <Icon name="check" size={15} style={{ color: "var(--brand)", marginLeft: 2 }} />}
              </button>
            );
          })}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 5, paddingTop: 5 }}>
            <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Icon name="plus" size={16} /> Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sidebar resize handle ---------------- */
function ResizeHandle() {
  const onDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX, root = document.documentElement;
    const startW = parseInt(getComputedStyle(root).getPropertyValue("--side")) || 268;
    const aside = (e.currentTarget as HTMLElement).closest("aside") as HTMLElement | null;
    if (aside) aside.style.transition = "none";
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
    const move = (ev: MouseEvent) => { const w = Math.max(220, Math.min(420, startW + (ev.clientX - startX))); root.style.setProperty("--side", w + "px"); };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      document.body.style.cursor = ""; document.body.style.userSelect = "";
      if (aside) aside.style.transition = "width var(--t-slow) var(--ease-out)";
      try { localStorage.setItem("cdc-side", getComputedStyle(root).getPropertyValue("--side").trim()); } catch {}
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };
  const reset = () => { document.documentElement.style.setProperty("--side", "268px"); try { localStorage.removeItem("cdc-side"); } catch {} };
  return (
    <div onMouseDown={onDown} onDoubleClick={reset} title="Drag to resize · double-click to reset" style={{ position: "absolute", top: 0, right: -3, width: 8, height: "100%", cursor: "col-resize", zIndex: 40, display: "flex", justifyContent: "center" }}>
      <span style={{ width: 2, height: "100%", background: "transparent", transition: "background var(--t) var(--ease-out)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} />
    </div>
  );
}

/* ---------------- Notifications panel ---------------- */
function NotifPanel({ notifications, onClose, onManage, viewAllHref }: { notifications: NotifGroup[]; onClose: () => void; onManage?: () => void; viewAllHref?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, true);
  return (
    <div ref={ref} className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380, maxHeight: 540, overflowY: "auto", borderRadius: "var(--r-xl)", zIndex: 70, animation: "pop .16s var(--ease-out)" }}>
      <div style={{ position: "sticky", top: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--glass-2)", backdropFilter: "blur(8px)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Notifications</div>
        <button style={{ fontSize: 12, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>
      </div>
      {notifications.map((g, gi) => (
        <div key={gi}>
          <div style={{ padding: "10px 16px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>{g.group}</div>
          {g.items.map((n) => (
            <div key={n.id} style={{ display: "flex", gap: 11, padding: "11px 16px", cursor: "pointer", transition: "background var(--t-fast)", borderTop: "1px solid var(--line)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: n.ai ? "var(--ai-tint)" : "var(--surface-2)", color: n.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}><Icon name={n.icon} size={15} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{n.title}</span>
                  {n.ai && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9.5, padding: "0 5px" }}>AI</Pill>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: n.ai ? "var(--ai-ink)" : "var(--brand)", display: "inline-flex", gap: 4, alignItems: "center" }}>{n.action} <Icon name="chevR" size={12} /></span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{n.time} ago</span>
                </div>
              </div>
              {n.unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--brand)", flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => { onManage?.(); onClose(); }} style={{ position: "sticky", bottom: 0, width: "100%", display: "flex", justifyContent: "center", gap: 6, alignItems: "center", padding: "11px 16px", border: "none", borderTop: "1px solid var(--line)", background: "var(--glass-2)", backdropFilter: "blur(8px)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
        <Icon name="settings" size={14} /> Notification preferences
      </button>
    </div>
  );
}

/* ---------------- User menu ---------------- */
function UserMenu({ user, role, roles, onSetRole, onNavigate, onShortcuts, onSignOut }: {
  user: ShellUser; role: string; roles: Record<string, RoleMeta>; onSetRole: (r: string) => void; onNavigate?: (id: string) => void; onShortcuts?: () => void; onSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 6px 4px 4px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: open ? "var(--line-2)" : "transparent", background: open ? "var(--surface-2)" : "transparent", cursor: "pointer" }}>
        <div className="mono" style={{ width: 30, height: 30, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>{user.initials}</div>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, paddingRight: 2 }}>{user.name}</span>
        <Icon name="chevD" size={14} style={{ color: "var(--ink-3)" }} />
      </button>
      {open && (
        <div className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 264, borderRadius: "var(--r-lg)", padding: 7, zIndex: 70, animation: "pop .16s var(--ease-out)" }}>
          <div style={{ padding: "9px 10px 11px", display: "flex", gap: 10, alignItems: "center" }}>
            <div className="mono" style={{ width: 38, height: 38, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>{user.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{user.email}</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "9px 10px 6px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7, display: "flex", gap: 5, alignItems: "center" }}><Icon name="eye" size={12} /> Preview role · re-gates nav</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {Object.entries(roles).map(([k, v]) => (
                <button key={k} onClick={() => onSetRole(k)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 9px", borderRadius: 99, cursor: "pointer", border: "1px solid", borderColor: role === k ? "transparent" : "var(--line-2)", background: role === k ? "var(--brand-tint)" : "transparent", color: role === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{v.short}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 5 }}>
            {/* "Keyboard shortcuts" removed from this menu — shortcuts now surface as
                hover tooltips on the buttons that own them (see nav item `title`s). */}
            {([["Account settings", "settings", () => { onNavigate?.("settings"); setOpen(false); }]] as [string, IconName, () => void][]).map(([t, i, fn]) => (
              <button key={t} onClick={fn} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontSize: "var(--fs-sm)", fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <Icon name={i} size={16} /> {t}
              </button>
            ))}
            <button onClick={onSignOut} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--danger)", fontSize: "var(--fs-sm)", fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--danger-tint)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Command palette ---------------- */
function CommandPalette({ open, commands, onClose, onNav }: { open: boolean; commands: CommandGroup[]; onClose: () => void; onNav: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  const groups = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return commands.map((g) => ({ ...g, items: g.items.filter((it) => !ql || it.label.toLowerCase().includes(ql) || (it.meta || "").toLowerCase().includes(ql)) })).filter((g) => g.items.length);
  }, [q, commands]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); const it = flat[sel]; if (it) { if (it.nav) onNav(it.nav); onClose(); } }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, flat, sel]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  let idx = -1;
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "11vh", background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", backdropFilter: "blur(4px)", animation: "pop .12s var(--ease-out)" }}>
      <div className="glass" style={{ width: "min(620px, 92vw)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--e3)", animation: "rise .2s var(--ease-out)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid var(--line)" }}>
          <Icon name="search" size={19} style={{ color: "var(--ink-3)" }} />
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} placeholder="Search candidates, reqs, or run a command…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-lg)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          <kbd className="mono" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 6, padding: "2px 7px" }}>esc</kbd>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
          {flat.length === 0 && <div style={{ padding: "30px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>No matches for &ldquo;{q}&rdquo;.</div>}
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>{g.group}</div>
              {g.items.map((it) => {
                idx++; const cur = idx; const isSel = cur === sel;
                return (
                  <button key={it.id} onMouseEnter={() => setSel(cur)} onClick={() => { if (it.nav) onNav(it.nav); onClose(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: "var(--r)", border: "none", cursor: "pointer", textAlign: "left", background: isSel ? (it.ai ? "var(--ai-tint)" : "var(--brand-tint)") : "transparent", transition: "background var(--t-fast)" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: it.ai ? "var(--ai-tint-2)" : "var(--surface-2)", color: it.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}><Icon name={it.icon} size={15} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: isSel && it.ai ? "var(--ai-ink)" : "var(--ink)" }}>{it.label}</span>
                      {it.meta && <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-3)" }}>{it.meta}</span>}
                    </span>
                    {it.ai && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9.5, padding: "1px 6px" }}>AI</Pill>}
                    {it.kbd && <kbd className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 5, padding: "1px 6px" }}>{it.kbd}</kbd>}
                    {isSel && <Icon name="enter" size={15} style={{ color: "var(--ink-3)" }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "9px 16px", borderTop: "1px solid var(--line)", background: "var(--glass-2)", fontSize: 11, color: "var(--ink-3)" }}>
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><kbd className="mono" style={{ background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 4, padding: "0 5px" }}>↑↓</kbd> navigate</span>
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><kbd className="mono" style={{ background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 4, padding: "0 5px" }}>↵</kbd> select</span>
          <span style={{ flex: 1 }} />
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="sparkles" size={12} style={{ color: "var(--ai)" }} /> violet = AI action</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Safety banner (super admin) ---------------- */
function SafetyBanner({ ws }: { ws: Workspace }) {
  return (
    <div style={{ height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--on-ai)", background: "linear-gradient(90deg, var(--ai-2), var(--ai))", zIndex: 40, position: "relative" }}>
      <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="bolt" size={14} /> Platform Operator, cross-tenant access. You are viewing <b>{ws.name}</b>.</span>
      <span className="mono" style={{ opacity: 0.9, display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="clock" size={13} /> impersonation expires 58:24</span>
      <button style={{ fontSize: 11.5, fontWeight: 700, color: "var(--on-ai)", background: "color-mix(in oklab, black 16%, transparent)", border: "1px solid color-mix(in oklab, white 30%, transparent)", borderRadius: 99, padding: "2px 10px", cursor: "pointer" }}>Exit session</button>
    </div>
  );
}

/* ---------------- Shell ---------------- */
export interface ShellProps {
  user: ShellUser;
  workspace: Workspace;
  workspaces?: Workspace[];
  roles: Record<string, RoleMeta>;
  nav: NavSection[];
  commands?: CommandGroup[];
  notifications?: NotifGroup[];
  planUsage?: PlanUsage;
  activeId?: string;                       // controlled active route id (else internal)
  breadcrumbTitle?: string;                // title shown in the top bar
  hasUnreadNotifs?: boolean;
  logoLight?: string;                      // src for light-theme logo image
  logoDark?: string;                       // src for dark-theme logo image
  onNavigate?: (id: string) => void;
  onSwitchWorkspace?: (w: Workspace) => void;
  onSetRole?: (role: string) => void;
  onThemeChange?: (t: string) => void;
  onSignOut?: () => void;
  onShortcuts?: () => void;
  // D6 / WF-D — optional render-prop seams the adapter (cd-shell) fills with the
  // WF-B <Slot/> at the closed-union shell positions. ADDITIVE + FAIL-SOFT: when a
  // prop is undefined nothing is rendered, so the chrome is byte-identical to today.
  //   headerRight — mounts at the app header's trailing edge (slot shell.header.right),
  //                 just before the notifications bell.
  //   navFooter   — mounts below the primary navigation, above the plan-usage card
  //                 (slot shell.nav.footer). Hidden on a collapsed rail so it never
  //                 overflows the icon-only sidebar.
  headerRight?: React.ReactNode;
  navFooter?: React.ReactNode;
  children: React.ReactNode;
}

export function Shell(props: ShellProps) {
  const {
    user, workspace, workspaces = [workspace], roles, nav, commands = [], notifications = [],
    planUsage, breadcrumbTitle, hasUnreadNotifs = true, logoLight, logoDark,
    onNavigate, onSwitchWorkspace, onSetRole, onThemeChange, onSignOut, onShortcuts,
    headerRight, navFooter, children,
  } = props;

  const [theme, toggleTheme] = useTheme(onThemeChange);
  const [role, setRole] = useState(user.role);
  const [collapsed, setCollapsed] = useState(false);
  const [internalActive, setInternalActive] = useState(props.activeId ?? "home");
  const active = props.activeId ?? internalActive;
  const [palette, setPalette] = useState(false);
  const [notif, setNotif] = useState(false);
  const vw = useVP();
  const mobile = vw < 860;
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { if (!mobile) setDrawer(false); }, [mobile]);
  useEffect(() => { try { const w = localStorage.getItem("cdc-side"); if (w) document.documentElement.style.setProperty("--side", w); } catch {} }, []);

  const go = (id: string) => { setInternalActive(id); onNavigate?.(id); if (mobile) setDrawer(false); };
  const pickRole = (r: string) => { setRole(r); onSetRole?.(r); };

  // global shortcuts
  const gPending = useRef(false);
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => { const t = e.target as HTMLElement; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as any).isContentEditable); };
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); toggleTheme(); return; }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") { e.preventDefault(); onShortcuts?.(); return; }
      if (e.key === "/") { e.preventDefault(); setPalette(true); return; }
      if (e.key.toLowerCase() === "g") { gPending.current = true; setTimeout(() => { gPending.current = false; }, 900); return; }
      if (gPending.current) {
        const map: Record<string, string> = { d: "home", c: "candidates", r: "requisitions", a: "analytics", s: "screening", i: "interviews", o: "offers" };
        const dest = map[e.key.toLowerCase()];
        if (dest) { e.preventDefault(); go(dest); }
        gPending.current = false;
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [toggleTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // role-gated sections
  const sections = nav
    .map((s) => ({ ...s, items: s.items.filter((it) => !it.roles || it.roles.includes(role)) }))
    .filter((s) => s.items.length);

  const navItem = nav.flatMap((s) => s.items).find((i) => i.id === active);
  const title = breadcrumbTitle ?? (active === "home" ? "Home" : navItem ? navItem.label : "Home");

  const sidebar = (
    <aside style={{ width: (mobile ? "var(--side)" : collapsed ? "var(--rail)" : "var(--side)"), flexShrink: 0, height: "100%", position: "relative", display: "flex", flexDirection: "column", borderRight: "1px solid var(--line)", background: "color-mix(in oklab, var(--surface) 60%, transparent)", backdropFilter: "blur(8px)", transition: "width var(--t-slow) var(--ease-out)", overflow: "hidden", zIndex: 20,
      ...(mobile ? { position: "fixed" as const, top: 0, bottom: 0, left: 0, width: "min(82vw, 300px)", transform: drawer ? "none" : "translateX(-102%)", boxShadow: drawer ? "var(--e3)" : "none", transition: "transform var(--t-slow) var(--ease-out)", zIndex: 120, background: "var(--surface)" } : {}) }}>
      <div style={{ padding: collapsed && !mobile ? "14px 12px 10px" : "14px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12, justifyContent: collapsed && !mobile ? "center" : "flex-start", paddingLeft: collapsed && !mobile ? 0 : 3 }}>
          {collapsed && !mobile ? <Logo size={26} /> : (logoLight || logoDark) ? <>
            {logoLight && <img src={logoLight} className="brandlogo brandlogo-l" alt={`${workspace.name}`} style={{ height: 24, width: "auto", display: theme === "dark" ? "none" : "block" }} />}
            {logoDark && <img src={logoDark} className="brandlogo brandlogo-d" alt={`${workspace.name}`} style={{ height: 24, width: "auto", display: theme === "dark" ? "block" : "none" }} />}
          </> : <Logo size={26} />}
        </div>
        <OrgSwitcher ws={workspace} workspaces={workspaces} roles={roles} onPick={(w) => { onSwitchWorkspace?.(w); pickRole(w.role); }} collapsed={collapsed && !mobile} />
      </div>
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed && !mobile ? "4px 12px 16px" : "4px 10px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
        {sections.map((s, si) => (
          <div key={si} style={{ marginTop: s.section ? 14 : 2 }}>
            {s.section && !(collapsed && !mobile) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: s.platform ? "var(--danger)" : "var(--ink-3)" }}>
                {s.platform && <Icon name="bolt" size={11} />} {s.section}
              </div>
            )}
            {s.section && collapsed && !mobile && <div style={{ height: 1, background: "var(--line)", margin: "10px 6px" }} />}
            {s.items.map((it) => {
              const on = active === it.id;
              return (
                <button key={it.id} title={collapsed && !mobile ? it.label : undefined} onClick={() => go(it.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: collapsed && !mobile ? "9px 0" : "8px 10px", justifyContent: collapsed && !mobile ? "center" : "flex-start", marginBottom: 1, borderRadius: "var(--r)", border: "none", cursor: "pointer", position: "relative", background: on ? "var(--brand-tint)" : "transparent", color: on ? "var(--brand-ink)" : "var(--ink-2)", fontWeight: on ? 700 : 500, fontSize: "var(--fs-sm)", transition: "background var(--t-fast), color var(--t-fast)" }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  {on && !(collapsed && !mobile) && <span style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 3, background: "var(--brand)" }} />}
                  <span style={{ position: "relative", flexShrink: 0, color: on ? "var(--brand)" : "var(--ink-3)" }}>
                    <Icon name={it.icon} size={18} stroke={on ? 2 : 1.7} />
                    {it.ai && <span style={{ position: "absolute", top: -2, right: -3, width: 6, height: 6, borderRadius: 99, background: "var(--ai)", boxShadow: "0 0 0 2px var(--surface)" }} />}
                  </span>
                  {!(collapsed && !mobile) && <>
                    <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{it.label}</span>
                    {/* WF9 / SLICE I3 — plan-locked module: a padlock + upgrade chip
                        in place of the count, so the feature stays discoverable and
                        clicking routes to the upgrade path rather than a dead 402.
                        `it.lock` is undefined for every v1 item -> unchanged. */}
                    {it.lock ? (
                      <span title="Not included in your plan — upgrade to enable" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, letterSpacing: ".02em", color: "var(--ai)", background: "var(--ai-tint)", padding: "1px 7px 1px 5px", borderRadius: 99, flexShrink: 0 }}>
                        <Icon name="lock" size={11} stroke={2.2} />Upgrade
                      </span>
                    ) : it.count != null ? (
                      <span className="mono tnum" style={{ fontSize: 11, fontWeight: 600, color: on ? "var(--brand)" : "var(--ink-3)", background: on ? "var(--surface)" : "var(--surface-2)", padding: "1px 7px", borderRadius: 99 }}>{it.count}</span>
                    ) : null}
                  </>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {/* D6 — shell.nav.footer seam: a custom block below the primary nav. Only on
          the expanded sidebar (an icon-only rail has no room); undefined -> nothing. */}
      {!(collapsed && !mobile) && navFooter && (
        <div style={{ padding: "0 10px 6px" }}>{navFooter}</div>
      )}
      {!(collapsed && !mobile) && planUsage && (
        <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "11px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: planUsage.unlimited ? 0 : 7 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>{planUsage.label}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{planUsage.used.toLocaleString()} / {planUsage.unlimited ? "∞" : planUsage.limit.toLocaleString()}</span>
            </div>
            {planUsage.unlimited ? (
              // Unlimited plan (e.g. Enterprise seats): no cap to meter and nothing
              // to upgrade past, so show a plain caption instead of a full bar +
              // "Upgrade plan" CTA (which would falsely read as a maxed-out seat cap).
              <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>Unlimited seats included</div>
            ) : (
              <>
                <div style={{ height: 6, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(100, (planUsage.used / planUsage.limit) * 100) + "%", borderRadius: 99, background: "linear-gradient(90deg, var(--brand-2), var(--brand))" }} />
                </div>
                <button onClick={() => go("billing")} style={{ marginTop: 9, width: "100%", padding: "6px", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontWeight: 600, fontSize: 11.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Upgrade plan</button>
              </>
            )}
          </div>
        </div>
      )}
      {!mobile && !collapsed && <ResizeHandle />}
    </aside>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {role === "super_admin" && <SafetyBanner ws={workspace} />}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
        {mobile && drawer && <div onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 110, background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", backdropFilter: "blur(3px)", animation: "pop .15s var(--ease-out)" }} />}
        {sidebar}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ height: "var(--topbar)", flexShrink: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px 0 14px", borderBottom: "1px solid var(--line)", background: "var(--glass)", backdropFilter: "blur(var(--glass-blur)) saturate(160%)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(160%)", zIndex: 30, position: "relative" }}>
            <button onClick={() => (mobile ? setDrawer(true) : setCollapsed((c) => !c))} title={mobile ? "Menu" : "Toggle sidebar"} style={{ width: 34, height: 34, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
              {mobile ? <Icon name="grid" size={17} /> : <Icon name="chevsL" size={17} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", fontWeight: 500, whiteSpace: "nowrap" }}>{workspace.name}</span>
              <Icon name="chevR" size={13} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
              <span style={{ fontSize: "var(--fs-md)", fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</span>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => setPalette(true)} style={{ display: "flex", alignItems: "center", gap: 10, height: 36, padding: mobile ? "0" : "0 10px 0 12px", width: mobile ? 36 : undefined, justifyContent: mobile ? "center" : undefined, minWidth: mobile ? 36 : 240, maxWidth: 340, flex: mobile ? "0 0 auto" : "0 1 320px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-3)", cursor: "text", transition: "border-color var(--t), box-shadow var(--t)" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line-2)"}>
              <Icon name="search" size={16} />
              {!mobile && <><span style={{ flex: 1, textAlign: "left", fontSize: "var(--fs-sm)" }}>Search or run a command…</span>
                <kbd className="mono" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 6, padding: "2px 6px", fontWeight: 600 }}>⌘K</kbd></>}
            </button>
            {/* D6 — shell.header.right seam: a custom block on the header's trailing
                edge, before the bell. undefined -> nothing (byte-identical chrome). */}
            {headerRight && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{headerRight}</div>}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotif((n) => !n)} title="Notifications" style={{ width: 36, height: 36, borderRadius: "var(--r)", border: "1px solid", borderColor: notif ? "var(--line-2)" : "transparent", background: notif ? "var(--surface-2)" : "transparent", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
                <Icon name="bell" size={18} />
                {hasUnreadNotifs && <span style={{ position: "absolute", top: 7, right: 8, width: 8, height: 8, borderRadius: 99, background: "var(--danger)", boxShadow: "0 0 0 2px var(--surface)" }} />}
              </button>
              {notif && <NotifPanel notifications={notifications} onClose={() => setNotif(false)} onManage={() => go("notifications")} />}
            </div>
            <button onClick={(e) => toggleTheme(e)} title="Toggle theme" style={{ width: 36, height: 36, borderRadius: "var(--r)", border: "1px solid transparent", background: "transparent", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", overflow: "hidden" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <div style={{ width: 1, height: 24, background: "var(--line)", margin: "0 2px" }} />
            <UserMenu user={user} role={role} roles={roles} onSetRole={pickRole} onNavigate={go} onShortcuts={onShortcuts} onSignOut={onSignOut} />
          </header>
          <main style={{ flex: 1, overflow: "hidden", padding: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>{children}</main>
        </div>
      </div>
      <CommandPalette open={palette} commands={commands} onClose={() => setPalette(false)} onNav={go} />
    </div>
  );
}
