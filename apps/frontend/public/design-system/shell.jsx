/* shell.jsx, the global app shell: sidebar, top bar, ⌘K palette, notifications, themes */
const { useState: uS, useEffect: uE, useRef: uR, useMemo } = React;
const { Btn, Pill } = window.UI;

/* ---------- hooks ---------- */
function useTheme() {
  const [theme, setTheme] = uS(() => localStorage.getItem("cdc-theme") || "light");
  uE(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("cdc-theme", theme); }, [theme]);
  const toggle = (e) => {
    const next = theme === "dark" ? "light" : "dark";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) { setTheme(next); return; }
    const x = e ? e.clientX : innerWidth - 80, y = e ? e.clientY : 40;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(() => { ReactDOM.flushSync(() => setTheme(next)); });
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 480, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };
  return [theme, toggle];
}

function useClickOutside(ref, onOut, active) {
  uE(() => {
    if (!active) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOut(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [active]);
}

/* ---------- Org / workspace switcher ---------- */
function OrgSwitcher({ ws, onPick, collapsed }) {
  const [open, setOpen] = uS(false);
  const ref = uR();
  useClickOutside(ref, () => setOpen(false), open);
  const plan = window.PLAN_META[ws.plan];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? 0 : "8px 9px",
        background: open ? "var(--surface-2)" : "transparent", border: "1px solid", borderColor: open ? "var(--line-2)" : "transparent",
        borderRadius: "var(--r-lg)", cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start",
        transition: "background var(--t), border-color var(--t)" }}>
        <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center",
          background: "color-mix(in oklab, " + ws.color + " 16%, var(--surface))", color: ws.color, fontWeight: 700, fontSize: 13,
          border: "1px solid color-mix(in oklab, " + ws.color + " 24%, transparent)" }} className="mono">{ws.initials}</div>
        {!collapsed && <>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em", color: plan.tone, background: plan.bg, padding: "1px 6px", borderRadius: 5 }}>{ws.plan}</span>
            </div>
          </div>
          <Icon name="chevExpand" size={15} style={{ color: "var(--ink-3)" }} />
        </>}
      </button>

      {open && (
        <div className="glass" style={{ position: "absolute", top: collapsed ? 44 : "calc(100% + 6px)", left: 0,
          width: 286, zIndex: 60, borderRadius: "var(--r-lg)", padding: 6, animation: "pop .16s var(--ease-out)" }}>
          <div style={{ padding: "7px 9px 5px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--ink-3)" }}>Workspaces</div>
          {window.WORKSPACES.map(w => {
            const p = window.PLAN_META[w.plan], active = w.id === ws.id;
            return (
              <button key={w.id} onClick={() => { onPick(w); setOpen(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: "var(--r)",
                border: "none", cursor: "pointer", background: active ? "var(--brand-tint)" : "transparent", textAlign: "left",
                transition: "background var(--t-fast)" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <div className="mono" style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
                  background: "color-mix(in oklab, " + w.color + " 16%, var(--surface))", color: w.color, fontWeight: 700, fontSize: 12 }}>{w.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 1 }}>
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{window.ROLES[w.role].label}</span>
                    {w.invites > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--warn)", background: "var(--warn-tint)", padding: "0 5px", borderRadius: 5 }}>{w.invites} invite{w.invites>1?"s":""}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: p.tone, background: p.bg, padding: "1px 6px", borderRadius: 5 }}>{w.plan}</span>
                {active && <Icon name="check" size={15} style={{ color: "var(--brand)", marginLeft: 2 }} />}
              </button>
            );
          })}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 5, paddingTop: 5 }}>
            <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="plus" size={16} /> Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sidebar resize handle ---------- */
function ResizeHandle() {
  const onDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const root = document.documentElement;
    const startW = parseInt(getComputedStyle(root).getPropertyValue("--side")) || 268;
    const aside = e.currentTarget.closest("aside");
    if (aside) aside.style.transition = "none";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev) => {
      const w = Math.max(220, Math.min(420, startW + (ev.clientX - startX)));
      root.style.setProperty("--side", w + "px");
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (aside) aside.style.transition = "width var(--t-slow) var(--ease-out)";
      try { localStorage.setItem("cdc-side", getComputedStyle(root).getPropertyValue("--side").trim()); } catch (err) {}
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  const reset = () => {
    document.documentElement.style.setProperty("--side", "268px");
    try { localStorage.removeItem("cdc-side"); } catch (err) {}
  };
  return (
    <div onMouseDown={onDown} onDoubleClick={reset} title="Drag to resize · double-click to reset"
      style={{ position: "absolute", top: 0, right: -3, width: 8, height: "100%", cursor: "col-resize", zIndex: 40, display: "flex", justifyContent: "center" }}>
      <span style={{ width: 2, height: "100%", background: "transparent", transition: "background var(--t) var(--ease-out)" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--brand)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} />
    </div>
  );
}

/* ---------- Sidebar nav ---------- */
function Sidebar({ role, active, setActive, collapsed, ws, setWs, setRole, mobile, drawer, onClose }) {
  const sections = window.NAV
    .map(s => ({ ...s, items: s.items.filter(it => it.roles.includes(role)) }))
    .filter(s => s.items.length);
  const pick = (id) => { setActive(id); if (mobile) onClose && onClose(); };
  const mobileStyle = mobile ? { position: "fixed", top: 0, bottom: 0, left: 0, width: "min(82vw, 300px)", transform: drawer ? "none" : "translateX(-102%)", boxShadow: drawer ? "var(--e3)" : "none", transition: "transform var(--t-slow) var(--ease-out)", zIndex: 120, background: "var(--surface)", backdropFilter: "blur(var(--glass-blur))" } : {};
  return (
    <aside style={{ width: collapsed ? "var(--rail)" : "var(--side)", flexShrink: 0, height: "100%", position: "relative",
      display: "flex", flexDirection: "column", borderRight: "1px solid var(--line)",
      background: "color-mix(in oklab, var(--surface) 60%, transparent)", backdropFilter: "blur(8px)",
      transition: "width var(--t-slow) var(--ease-out)", overflow: "hidden", zIndex: 20, ...mobileStyle }}>
      {/* brand + org */}
      <div style={{ padding: collapsed ? "14px 12px 10px" : "14px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12, justifyContent: collapsed ? "center" : "flex-start", paddingLeft: collapsed ? 0 : 3 }}>
          {collapsed ? <Logo size={26} /> : <>
            <img src="assets/logo-light.png" className="brandlogo brandlogo-l" alt="TalentFlow ATS" style={{ height: 24, width: "auto", display: "block" }} />
            <img src="assets/logo-dark.png" className="brandlogo brandlogo-d" alt="TalentFlow ATS" style={{ height: 24, width: "auto", display: "none" }} />
          </>}
        </div>
        <OrgSwitcher ws={ws} onPick={(w) => { setWs(w); setRole(w.role); }} collapsed={collapsed} />
      </div>

      {/* nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "4px 12px 16px" : "4px 10px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
        {sections.map((s, si) => (
          <div key={si} style={{ marginTop: s.section ? 14 : 2 }}>
            {s.section && !collapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: s.platform ? "var(--danger)" : "var(--ink-3)" }}>
                {s.platform && <Icon name="bolt" size={11} />} {s.section}
              </div>
            )}
            {s.section && collapsed && <div style={{ height: 1, background: "var(--line)", margin: "10px 6px" }} />}
            {s.items.map(it => {
              const on = active === it.id;
              return (
                <button key={it.id} title={collapsed ? it.label : undefined} onClick={() => pick(it.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "9px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start", marginBottom: 1,
                  borderRadius: "var(--r)", border: "none", cursor: "pointer", position: "relative",
                  background: on ? "var(--brand-tint)" : "transparent", color: on ? "var(--brand-ink)" : "var(--ink-2)",
                  fontWeight: on ? 700 : 500, fontSize: "var(--fs-sm)", transition: "background var(--t-fast), color var(--t-fast)" }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  {on && !collapsed && <span style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 3, background: "var(--brand)" }} />}
                  <span style={{ position: "relative", flexShrink: 0, color: on ? "var(--brand)" : "var(--ink-3)" }}>
                    <Icon name={it.icon} size={18} stroke={on ? 2 : 1.7} />
                    {it.ai && <span style={{ position: "absolute", top: -2, right: -3, width: 6, height: 6, borderRadius: 99, background: "var(--ai)", boxShadow: "0 0 0 2px var(--surface)" }} />}
                  </span>
                  {!collapsed && <>
                    <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{it.label}</span>
                    {it.count != null && <span className="mono tnum" style={{ fontSize: 11, fontWeight: 600, color: on ? "var(--brand)" : "var(--ink-3)", background: on ? "var(--surface)" : "var(--surface-2)", padding: "1px 7px", borderRadius: 99 }}>{it.count}</span>}
                  </>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* plan usage footer */}
      {!collapsed && (
        <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "11px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>Résumés this month</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>3, 180 / 5, 000</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "64%", borderRadius: 99, background: "linear-gradient(90deg, var(--brand-2), var(--brand))" }} />
            </div>
            <button onClick={() => pick("billing")} style={{ marginTop: 9, width: "100%", padding: "6px", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontWeight: 600, fontSize: 11.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Upgrade plan</button>
          </div>
        </div>
      )}
      {!mobile && !collapsed && <ResizeHandle />}
    </aside>
  );
}

/* ---------- Notifications panel ---------- */
function NotifPanel({ onClose, onManage }) {
  const ref = uR();
  useClickOutside(ref, onClose, true);
  return (
    <div ref={ref} className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380, maxHeight: 540, overflowY: "auto",
      borderRadius: "var(--r-xl)", zIndex: 70, animation: "pop .16s var(--ease-out)" }}>
      <div style={{ position: "sticky", top: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--glass-2)", backdropFilter: "blur(8px)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Notifications</div>
        <button style={{ fontSize: 12, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>
      </div>
      {window.NOTIFS.map((g, gi) => (
        <div key={gi}>
          <div style={{ padding: "10px 16px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>{g.group}</div>
          {g.items.map(n => (
            <div key={n.id} style={{ display: "flex", gap: 11, padding: "11px 16px", cursor: "pointer", transition: "background var(--t-fast)", borderTop: "1px solid var(--line)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center",
                background: n.ai ? "var(--ai-tint)" : "var(--surface-2)", color: n.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}>
                <Icon name={n.icon} size={15} />
              </div>
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
      <a href="Notifications.html" style={{ position: "sticky", bottom: 40, width: "100%", display: "flex", justifyContent: "center", gap: 6, alignItems: "center", padding: "11px 16px", borderTop: "1px solid var(--line)", background: "var(--surface)", color: "var(--brand)", fontWeight: 700, fontSize: 12.5, textDecoration: "none" }}>
        View all notifications <Icon name="chevR" size={13} />
      </a>
      <button onClick={() => { onManage && onManage(); onClose(); }} style={{ position: "sticky", bottom: 0, width: "100%", display: "flex", justifyContent: "center", gap: 6, alignItems: "center", padding: "11px 16px", border: "none", borderTop: "1px solid var(--line)", background: "var(--glass-2)", backdropFilter: "blur(8px)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
        <Icon name="settings" size={14} /> Notification preferences
      </button>
    </div>
  );
}
function UserMenu({ role, setRole, theme, toggleTheme, onNavigate, onShortcuts }) {
  const [open, setOpen] = uS(false);
  const ref = uR();
  useClickOutside(ref, () => setOpen(false), open);
  const r = window.ROLES[role];
  const actions = {
    "Account settings": () => { onNavigate && onNavigate("settings"); setOpen(false); },
    "Keyboard shortcuts": () => { onShortcuts && onShortcuts(); setOpen(false); },
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 6px 4px 4px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: open ? "var(--line-2)" : "transparent", background: open ? "var(--surface-2)" : "transparent", cursor: "pointer" }}>
        <div style={{ width: 30, height: 30, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }} className="mono">AC</div>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, paddingRight: 2 }}>Avery Chen</span>
        <Icon name="chevD" size={14} style={{ color: "var(--ink-3)" }} />
      </button>
      {open && (
        <div className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 264, borderRadius: "var(--r-lg)", padding: 7, zIndex: 70, animation: "pop .16s var(--ease-out)" }}>
          <div style={{ padding: "9px 10px 11px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }} className="mono">AC</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Avery Chen</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>avery@northwind.co</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "9px 10px 6px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7, display: "flex", gap: 5, alignItems: "center" }}><Icon name="eye" size={12} /> Preview role · re-gates nav</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {Object.entries(window.ROLES).map(([k, v]) => (
                <button key={k} onClick={() => setRole(k)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 9px", borderRadius: 99, cursor: "pointer",
                  border: "1px solid", borderColor: role === k ? "transparent" : "var(--line-2)",
                  background: role === k ? "var(--brand-tint)" : "transparent", color: role === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{v.short}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 5 }}>
            {[["Account settings", "settings"], ["Keyboard shortcuts", "command"]].map(([t, i]) => (
              <button key={t} onClick={actions[t]} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontSize: "var(--fs-sm)", fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon name={i} size={16} /> {t}
              </button>
            ))}
            <button onClick={() => { try { localStorage.removeItem("cdc-theme"); } catch(e){} window.location.href = "Auth.html"; }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r)", border: "none", background: "transparent", cursor: "pointer", color: "var(--danger)", fontSize: "var(--fs-sm)", fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--danger-tint)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ ws, active, collapsed, setCollapsed, openPalette, role, setRole, theme, toggleTheme, onNavigate, onShortcuts, mobile, onMenu }) {
  const [notif, setNotif] = uS(false);
  const navItem = window.NAV.flatMap(s => s.items).find(i => i.id === active);
  const title = active === "home" ? "Home" : active === "notifications" ? "Notification preferences" : active === "design" ? "Design System" : (navItem ? navItem.label : "Home");
  return (
    <header style={{ height: "var(--topbar)", flexShrink: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px 0 14px",
      borderBottom: "1px solid var(--line)", background: "var(--glass)", backdropFilter: "blur(var(--glass-blur)) saturate(160%)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(160%)", zIndex: 30, position: "relative" }}>
      <button onClick={() => mobile ? onMenu() : setCollapsed(c => !c)} title={mobile ? "Menu" : "Toggle sidebar"} style={{ width: 34, height: 34, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
        {mobile ? <Icon name="grid" size={17} /> : <Icon name="chevsL" size={17} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />}
      </button>
      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", fontWeight: 500, whiteSpace: "nowrap" }}>{ws.name}</span>
        <Icon name="chevR" size={13} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <span style={{ fontSize: "var(--fs-md)", fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* ⌘K search */}
      <button onClick={openPalette} style={{ display: "flex", alignItems: "center", gap: 10, height: 36, padding: mobile ? "0" : "0 10px 0 12px", width: mobile ? 36 : undefined, justifyContent: mobile ? "center" : undefined, minWidth: mobile ? 36 : 240, maxWidth: 340, flex: mobile ? "0 0 auto" : "0 1 320px",
        borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-3)", cursor: "text", transition: "border-color var(--t), box-shadow var(--t)" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--line-strong)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line-2)"}>
        <Icon name="search" size={16} />
        {!mobile && <><span style={{ flex: 1, textAlign: "left", fontSize: "var(--fs-sm)" }}>Search or run a command…</span>
        <kbd className="mono" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 6, padding: "2px 6px", fontWeight: 600 }}>⌘K</kbd></>}
      </button>

      {/* notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setNotif(n => !n)} title="Notifications" style={{ width: 36, height: 36, borderRadius: "var(--r)", border: "1px solid", borderColor: notif ? "var(--line-2)" : "transparent", background: notif ? "var(--surface-2)" : "transparent", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
          <Icon name="bell" size={18} />
          <span style={{ position: "absolute", top: 7, right: 8, width: 8, height: 8, borderRadius: 99, background: "var(--danger)", boxShadow: "0 0 0 2px var(--surface)" }} />
        </button>
        {notif && <NotifPanel onClose={() => setNotif(false)} onManage={() => onNavigate && onNavigate("notifications")} />}
      </div>

      {/* theme toggle */}
      <button onClick={toggleTheme} title="Toggle theme" style={{ width: 36, height: 36, borderRadius: "var(--r)", border: "1px solid transparent", background: "transparent", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer", overflow: "hidden" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>

      <div style={{ width: 1, height: 24, background: "var(--line)", margin: "0 2px" }} />
      <UserMenu role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} onNavigate={onNavigate} onShortcuts={onShortcuts} />
    </header>
  );
}

/* ---------- Command palette ---------- */
function CommandPalette({ open, onClose, onNav }) {
  const [q, setQ] = uS("");
  const [sel, setSel] = uS(0);
  const inputRef = uR();
  uE(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const groups = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return window.COMMANDS.map(g => ({ ...g, items: g.items.filter(it => !ql || it.label.toLowerCase().includes(ql) || (it.meta||"").toLowerCase().includes(ql)) })).filter(g => g.items.length);
  }, [q]);
  const flat = useMemo(() => groups.flatMap(g => g.items), [groups]);

  uE(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(flat.length - 1, s + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); const it = flat[sel]; if (it) { if (it.nav) onNav(it.nav); onClose(); } }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, flat, sel]);

  if (!open) return null;
  let idx = -1;
  return (
    <div onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "11vh",
      background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", backdropFilter: "blur(4px)", animation: "pop .12s var(--ease-out)" }}>
      <div className="glass" style={{ width: "min(620px, 92vw)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--e3)", animation: "rise .2s var(--ease-out)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid var(--line)" }}>
          <Icon name="search" size={19} style={{ color: "var(--ink-3)" }} />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setSel(0); }} placeholder="Search candidates, reqs, or run a command…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-lg)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          <kbd className="mono" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 6, padding: "2px 7px" }}>esc</kbd>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
          {flat.length === 0 && <div style={{ padding: "30px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>No matches for “{q}”.</div>}
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>{g.group}</div>
              {g.items.map(it => {
                idx++; const cur = idx;
                const isSel = cur === sel;
                return (
                  <button key={it.id} onMouseEnter={() => setSel(cur)} onClick={() => { if (it.nav) onNav(it.nav); onClose(); }} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: "var(--r)", border: "none", cursor: "pointer", textAlign: "left",
                    background: isSel ? (it.ai ? "var(--ai-tint)" : "var(--brand-tint)") : "transparent", transition: "background var(--t-fast)" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center",
                      background: it.ai ? "var(--ai-tint-2)" : "var(--surface-2)", color: it.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}>
                      <Icon name={it.icon} size={15} />
                    </span>
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

/* ---------- Safety banner (super admin) ---------- */
function SafetyBanner({ ws }) {
  return (
    <div style={{ height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: "var(--fs-sm)", fontWeight: 600,
      color: "var(--on-ai)", background: "linear-gradient(90deg, var(--ai-2), var(--ai))", zIndex: 40, position: "relative" }}>
      <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="bolt" size={14} /> Platform Operator, cross-tenant access. You are viewing <b>{ws.name}</b>.</span>
      <span className="mono" style={{ opacity: .9, display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="clock" size={13} /> impersonation expires 58:24</span>
      <button style={{ fontSize: 11.5, fontWeight: 700, color: "var(--on-ai)", background: "color-mix(in oklab, black 16%, transparent)", border: "1px solid color-mix(in oklab, white 30%, transparent)", borderRadius: 99, padding: "2px 10px", cursor: "pointer" }}>Exit session</button>
    </div>
  );
}

/* ---------- Placeholder route (shows the empty-state language) ---------- */
function RoutePlaceholder({ active, role }) {
  const item = window.NAV.flatMap(s => s.items).find(i => i.id === active);
  if (!item) return null;
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 40 }}>
      <div style={{ textAlign: "center", maxWidth: 480, animation: "rise .4s var(--ease-out)" }}>
        <div className="illo" style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <span style={{ position: "absolute", inset: "auto", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 220, height: 150, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-tint) 0%, transparent 65%)", opacity: .55, pointerEvents: "none" }} />
          <window.Illo route={active} style={{ position: "relative" }} />
        </div>
        <Pill mono style={{ marginBottom: 12 }}>{item.ai ? "AI surface" : "route"} · /{active}</Pill>
        <h2 style={{ margin: "0 0 8px", fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{item.label}</h2>
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: "var(--fs-md)", lineHeight: 1.55 }}>
          This screen is part of a later group. The shell, role-gating ({window.ROLES[role].label}), {item.ai ? "AI accent, " : ""}empty-state language, and motion are all established here, every feature screen inherits this exact frame.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
          <Btn variant={item.ai ? "ai" : "primary"} icon={item.ai ? "sparkles" : "plus"}>{item.ai ? "Preview AI surface" : "Open " + item.label}</Btn>
          <Btn variant="soft" icon="layers">View design system</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- Keyboard shortcuts cheatsheet ---------- */
function ShortcutsModal({ onClose }) {
  uE(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  const GROUPS = [
    ["Global", [["Open command palette", ["⌘", "K"]], ["Keyboard shortcuts", ["?"]], ["Toggle theme", ["⌘", "/"]], ["Focus search", ["/"]], ["Go to dashboard", ["G", "D"]]]],
    ["Navigation", [["Go to candidates", ["G", "C"]], ["Go to requisitions", ["G", "R"]], ["Next item", ["J"]], ["Previous item", ["K"]], ["Open selected", ["↵"]], ["Back / dismiss", ["Esc"]]]],
    ["Review actions", [["Advance stage", ["E"]], ["Reject", ["R"]], ["Add note", ["N"]], ["Select row", ["X"]], ["Open résumé", ["R"]], ["Toggle blind review", ["B"]]]],
  ];
  const Keys = ({ ks }) => <span style={{ display: "inline-flex", gap: 4 }}>{ks.map((k, i) => <kbd key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 22, textAlign: "center", padding: "3px 6px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--line)", borderBottomWidth: 2, color: "var(--ink-2)" }}>{k}</kbd>)}</span>;
  return (
    <div onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 22, background: "var(--scrim, color-mix(in oklab, var(--bg-deep) 55%, transparent))", backdropFilter: "blur(4px)", animation: "fadein .2s var(--ease-out)" }}>
      <div className="glass" style={{ width: "min(680px, 96vw)", maxHeight: "84vh", overflowY: "auto", borderRadius: "var(--r-2xl)", boxShadow: "var(--e3)", animation: "pop .22s var(--ease-spring) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--glass)", backdropFilter: "blur(var(--glass-blur))", borderRadius: "var(--r-2xl) var(--r-2xl) 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)" }}><Icon name="command" size={17} /></span>
            <div><div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Keyboard shortcuts</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Move faster without the mouse</div></div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
          {GROUPS.map(([title, rows]) => (
            <div key={title}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>{title}</div>
              {rows.map(([label, ks], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <span style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{label}</span>
                  <Keys ks={ks} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- App root ---------- */
function useVP(){ const [w, setW] = uS(typeof window !== "undefined" ? window.innerWidth : 1200); uE(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []); return w; }
function App() {
  const [theme, toggleTheme] = useTheme();
  const [ws, setWs] = uS(window.WORKSPACES[0]);
  const [role, setRole] = uS(window.WORKSPACES[0].role);
  const [collapsed, setCollapsed] = uS(false);
  const [active, setActive] = uS("home");
  const [palette, setPalette] = uS(false);
  const [shortcuts, setShortcuts] = uS(false);
  const [portal, setPortal] = uS(false);
  const vw = useVP();
  const mobile = vw < 860;
  const [drawer, setDrawer] = uS(false);
  uE(() => { if (!mobile) setDrawer(false); }, [mobile]);
  uE(() => { try { const w = localStorage.getItem("cdc-side"); if (w) document.documentElement.style.setProperty("--side", w); } catch (e) {} }, []);

  const SCREENS = { screening: window.ScreeningQueueScreen, hitl: window.HitlScreen, compliance: window.ComplianceHubScreen, copilot: window.CopilotScreen, requisitions: window.RequisitionsScreen, candidates: window.CandidatesScreen, decisions: window.DecisionsScreen, interviews: window.InterviewsScreen, scheduling: window.SchedulingScreen, offers: window.OffersScreen, analytics: window.AnalyticsScreen, security: window.SecurityScreen, ai: window.AiOpsScreen, settings: window.SettingsScreen, billing: window.BillingScreen, tenants: window.TenantsScreen, pagents: window.PlatformAgentsScreen, pcost: window.PlatformCostScreen, prompts: window.PromptsScreen, preq: window.PlanRequestsScreen, paudit: window.PlatformAuditScreen, mobility: window.MobilityScreen, jobs: window.PlatformJobsScreen, notifications: window.NotificationsScreen, team: window.TeamScreen, integrations: window.IntegrationsScreen, support: window.SupportScreen, audit: window.AuditScreen };
  const Screen = SCREENS[active];

  // keep active valid for role
  uE(() => {
    const allowed = window.NAV.flatMap(s => s.items).filter(i => i.roles.includes(role)).map(i => i.id);
    if (active !== "home" && !allowed.includes(active)) setActive("home");
  }, [role]);

  const gPending = uR(false);
  uE(() => {
    const isTyping = (e) => { const t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
    const h = (e) => {
      // ⌘K / Ctrl+K, command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(p => !p); return; }
      // ⌘/, toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); toggleTheme(); return; }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") { e.preventDefault(); setShortcuts(true); return; }
      if (e.key === "/") { e.preventDefault(); setPalette(true); return; }
      // G then <key>, go to…
      if (e.key.toLowerCase() === "g") { gPending.current = true; setTimeout(() => { gPending.current = false; }, 900); return; }
      if (gPending.current) {
        const map = { d: "home", c: "candidates", r: "requisitions", a: "analytics", s: "screening", i: "interviews", o: "offers" };
        const dest = map[e.key.toLowerCase()];
        if (dest) { e.preventDefault(); setActive(dest); }
        gPending.current = false;
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [toggleTheme]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {role === "super_admin" && <SafetyBanner ws={ws} />}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
        {mobile && drawer && <div onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 110, background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", backdropFilter: "blur(3px)", animation: "pop .15s var(--ease-out)" }} />}
        <Sidebar role={role} active={active} setActive={setActive} collapsed={mobile ? false : collapsed} ws={ws} setWs={setWs} setRole={setRole} mobile={mobile} drawer={drawer} onClose={() => setDrawer(false)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar ws={ws} active={active} collapsed={collapsed} setCollapsed={setCollapsed} openPalette={() => setPalette(true)} role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} onNavigate={setActive} onShortcuts={() => setShortcuts(true)} mobile={mobile} onMenu={() => setDrawer(true)} />
          <main style={{ flex: 1, overflow: "hidden", padding: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {active === "home" ? <window.DashboardHome role={role} />
              : active === "design" ? <div style={{ overflowY: "auto", height: "100%", padding: "30px 32px" }}><window.FoundationsPage theme={theme} /></div>
              : Screen ? <Screen onPortal={() => setPortal(true)} />
              : <RoutePlaceholder active={active} role={role} />}
          </main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} onNav={(id) => setActive(id)} />
      {shortcuts && <ShortcutsModal onClose={() => setShortcuts(false)} />}
      {portal && <window.CandidatePortal onClose={() => setPortal(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
