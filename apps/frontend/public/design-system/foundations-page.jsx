/* foundations-page.jsx, the Design System showcase rendered inside the shell */
const { useState: useStateF } = React;

function FoundationsPage({ theme }) {
  const { Btn, Pill, StatusBadge, ScoreRing, Confidence, CountUp, Spark, fStyles, SectionHead, Swatch } = window.UI;
  const card = fStyles.card;

  const reqRows = [
    { label: "Distributed systems at scale", weight: 30, state: "pass", note: "Led Kafka pipeline, 1.2M msg/s, résumé §2" },
    { label: "Go / Rust proficiency", weight: 25, state: "pass", note: "5 yrs Go; Rust side projects, verified" },
    { label: "Must have fintech domain experience", weight: 25, state: "review", note: "Adjacent: payments at Stripe-like, partial", custom: true },
    { label: "Team leadership (5+)", weight: 20, state: "fail", note: "No direct reports found in history" },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 30, paddingBottom: 60 }}>

      {/* ---- intro band ---- */}
      <div className="glass" style={{ borderRadius: "var(--r-2xl)", padding: "30px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Pill icon="layers" tone="var(--brand)" bg="var(--brand-tint)">Aurora v1.0</Pill>
            <Pill mono tone="var(--ink-2)">{theme === "dark" ? "dark" : "light"} · oklch</Pill>
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-4xl)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.04 }}>
            The ATS design language.
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: "var(--fs-lg)", color: "var(--ink-2)", maxWidth: 620, lineHeight: 1.5 }}>
            An emerald soul for trust, one reserved violet accent for everything a machine produces, and a calm
            neutral canvas where the hiring data is the star. Calm chrome, loud content, light and dark from one system.
          </p>
          <div style={{ display: "flex", gap: 18, marginTop: 22, flexWrap: "wrap" }}>
            {[["Light + crafted dark","sun"],["Glass chrome, flat data","layers"],["One AI accent","sparkles"],["Reduced-motion safe","motion"]].map(([t,i]) => (
              <span key={t} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: "var(--fs-sm)", color: "var(--ink-2)", fontWeight: 500 }}>
                <Icon name={i} size={15} style={{ color: "var(--brand)" }} />{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---- principles ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { n: "01", t: "Trust", d: "Enterprise-grade restraint. Hairlines, tabular numerics, no decoration that isn't signal.", icon: "shield", c: "var(--brand)" },
          { n: "02", t: "Clarity", d: "You always know where you are and what to do next. The machine's reasoning is never hidden.", icon: "eye", c: "var(--info)" },
          { n: "03", t: "Delight", d: "Physical motion, ambient light through glass, a theme toggle that feels alive, never at the cost of speed.", icon: "bolt", c: "var(--ai)" },
        ].map(p => (
          <div key={p.n} style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>{p.n}</span>
              <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", color: p.c, background: "color-mix(in oklab," + p.c + " 12%, transparent)" }}>
                <Icon name={p.icon} size={17} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{p.t}</div>
            <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>{p.d}</p>
          </div>
        ))}
      </div>

      {/* ---- color ---- */}
      <div style={card}>
        <SectionHead icon="swatch" kicker="Foundations" title="Color & light"
          desc="Perceptually-even oklch ramps. Color is signal, not noise, the canvas stays neutral-dominant; brand and AI accents earn their saturation." />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ ...fStyles.label, marginBottom: 10 }}>Brand, emerald soul</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Swatch big name="Brand" varName="var(--brand)" oklch="0.585 .122 162" />
              <Swatch big name="Brand strong" varName="var(--brand-2)" oklch="0.515 .118 162" />
              <Swatch name="Tint" varName="var(--brand-tint)" oklch="0.955 .028 162" on="var(--brand)" />
              <Swatch name="Tint 2" varName="var(--brand-tint-2)" oklch="0.925 .045 162" on="var(--brand)" />
            </div>
          </div>
          <div>
            <div style={{ ...fStyles.label, marginBottom: 10, color: "var(--ai-ink)" }}>AI accent, reserved for machine surfaces only</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Swatch big name="AI" varName="var(--ai)" oklch="0.555 .185 292" on="var(--on-ai)" />
              <Swatch big name="AI strong" varName="var(--ai-2)" oklch="0.49 .19 292" on="var(--on-ai)" />
              <Swatch name="AI tint" varName="var(--ai-tint)" oklch="0.955 .03 292" on="var(--ai)" />
              <Swatch name="AI tint 2" varName="var(--ai-tint-2)" oklch="0.925 .05 292" on="var(--ai)" />
            </div>
          </div>
          <div>
            <div style={{ ...fStyles.label, marginBottom: 10 }}>Neutral canvas & semantics</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Swatch name="Canvas" varName="var(--bg)" oklch="0.984 .006 165" on="var(--ink)" />
              <Swatch name="Surface" varName="var(--surface)" oklch="0.997 .003 165" on="var(--ink)" />
              <Swatch name="Sunken" varName="var(--surface-3)" oklch="0.962 .008 165" on="var(--ink)" />
              <Swatch name="Ink" varName="var(--ink)" oklch="0.245 .013 175" on="var(--bg)" />
              <Swatch name="Success" varName="var(--ok)" oklch="0.60 .13 152" />
              <Swatch name="Warning" varName="var(--warn)" oklch="0.69 .135 73" />
              <Swatch name="Danger" varName="var(--danger)" oklch="0.565 .185 25" />
              <Swatch name="Info" varName="var(--info)" oklch="0.585 .13 245" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- typography ---- */}
      <div style={card}>
        <SectionHead icon="type" kicker="Foundations" title="Typography"
          desc="Hanken Grotesk, a humanist grotesk, carries UI and headlines. Geist Mono engineers every number, score, ID, and money value so columns align." />
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, borderRight: "1px solid var(--line)", paddingRight: 28 }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>Hire with trust</div>
            <div style={{ fontSize: 31, fontWeight: 700, letterSpacing: "-0.02em" }}>Display / Heading</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Section title, clear and calm</div>
            <div style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 4 }}>Body copy stays readable at 14 to 15px with a 1.5 line-height. The machine's reasoning is always shown in plain language.</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>Overline / Caption</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...fStyles.label }}>Geist Mono, tabular numerics</div>
            <div className="mono tnum" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
              <div>$182,000.00</div>
              <div>94<span style={{ color: "var(--ink-3)" }}> / 100</span></div>
              <div>REQ-4821</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {["300","400","500","600","700","800"].map(w => (
                <span key={w} style={{ fontWeight: w, fontSize: 15, padding: "3px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line)" }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- materials ---- */}
      <div style={card}>
        <SectionHead icon="shapes" kicker="Foundations" title="Materials & depth"
          desc="Glass for chrome, calm flat for data, clay for delight moments, ambient aurora for atmosphere. Depth is reserved for the frame, never for the table you're reading." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, position: "relative" }}>
          {[
            { cls: "glass", t: "Glass", d: "Nav, palette, bars, toasts. Frosted, luminous, legible.", role: "Chrome" },
            { cls: "clay", t: "Clay", d: "Onboarding, empty states, AI magic cards.", role: "Delight" },
            { cls: "flat", t: "Flat", d: "Tables, forms, dashboards. Calm and quiet.", role: "Data" },
            { cls: "aurora-tile", t: "Ambient", d: "Aurora + grain glowing behind low-data moments.", role: "Atmosphere" },
          ].map(m => (
            <div key={m.t} className={m.cls === "aurora-tile" ? "" : m.cls} style={{ borderRadius: "var(--r-lg)", padding: 16, minHeight: 132, display: "flex", flexDirection: "column", justifyContent: "space-between",
              ...(m.cls === "aurora-tile" ? { background: "radial-gradient(120% 100% at 20% 0%, var(--brand-tint-2), transparent 60%), radial-gradient(120% 120% at 100% 100%, var(--ai-tint-2), transparent 55%)", border: "1px solid var(--line)" } : {}) }}>
              <Pill mono style={{ alignSelf: "flex-start" }}>{m.role}</Pill>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{m.t}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.4 }}>{m.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- motion ---- */}
      <div style={card}>
        <SectionHead icon="motion" kicker="Foundations" title="Motion personality"
          desc="Spring-based and physical. Entrances stagger, numbers count up, charts draw in, the theme toggle reveals with a radial wipe. Everything degrades gracefully under reduced-motion." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[["--ease-out","cubic-bezier(.22, 1, .36, 1)","Exits & reveals"],["--ease-spring","cubic-bezier(.34, 1.4, .5, 1)","List & card entrances"],["--ease-io","cubic-bezier(.65, 0, .35, 1)","Ambient drift"]].map(([n,v,u]) => (
            <div key={n} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: 16 }}>
              <div className="mono" style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--brand)" }}>{n}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 8 }}>{u}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
          <Icon name="bolt" size={15} style={{ color: "var(--ai)" }} /> Durations, <span className="mono">130ms</span> micro · <span className="mono">240ms</span> standard · <span className="mono">460ms</span> theme &amp; route
        </div>
      </div>

      {/* ---- components ---- */}
      <div style={card}>
        <SectionHead icon="grid" kicker="Primitives" title="Work-surface components"
          desc="The reusable kit every screen is built from, and a first look at the AI-trust surfaces that set the product apart." />

        {/* buttons + badges */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={{ ...fStyles.label, marginBottom: 10 }}>Buttons</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Btn variant="primary" icon="plus">Create requisition</Btn>
              <Btn variant="ai" icon="sparkles">Generate JD</Btn>
              <Btn variant="soft" icon="eye">Preview</Btn>
              <Btn variant="ghost">Cancel</Btn>
            </div>
          </div>
          <div>
            <div style={{ ...fStyles.label, marginBottom: 10 }}>Status, icon + word, never color alone</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <StatusBadge kind="pass" /><StatusBadge kind="review" /><StatusBadge kind="fail" />
              <StatusBadge kind="open" /><StatusBadge kind="draft" />
            </div>
          </div>
        </div>

        {/* KPI + verdict */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr) 1.4fr", gap: 14 }}>
          {[
            { l: "Open reqs", v: 38, t: "+4", d: [12,15,14,18,17,22,20,24], up: true },
            { l: "Time-to-hire", v: 21, suf: "d", t: "−3d", d: [30,28,29,25,24,23,22,21], up: false, good: true },
            { l: "Offer accept", v: 86, suf: "%", t: "+2%", d: [78,80,79,82,83,84,85,86], up: true },
          ].map(k => (
            <div key={k.l} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: 16, boxShadow: "var(--e1)" }}>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", fontWeight: 500 }}>{k.l}</div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}><CountUp to={k.v} suffix={k.suf || ""} /></div>
                <Spark data={k.d} color={k.good === false || k.up ? "var(--brand)" : "var(--brand)"} />
              </div>
              <Pill style={{ marginTop: 8 }} tone={(k.good ?? k.up) ? "var(--ok)" : "var(--danger)"} bg="transparent">{k.t} vs last mo</Pill>
            </div>
          ))}
          {/* AI verdict mini */}
          <div style={{ gridColumn: "span 1", borderRadius: "var(--r-lg)", padding: 16, position: "relative",
            background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Pill icon="sparkles" tone="var(--on-ai)" bg="var(--ai)">AI · advisory</Pill>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <ScoreRing value={94} band="var(--ai)" label="match" />
              <div>
                <StatusBadge kind="pass" />
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.4 }}>Recommends <b style={{ color: "var(--ink)" }}>advance</b>, a human decides.</div>
              </div>
            </div>
          </div>
        </div>

        {/* screening verdict requirement table, the centerpiece, in miniature */}
        <div style={{ marginTop: 16, border: "1px solid color-mix(in oklab, var(--ai) 20%, var(--line))", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px",
            background: "var(--ai-tint)", borderBottom: "1px solid color-mix(in oklab, var(--ai) 18%, var(--line))" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <Icon name="scan" size={16} style={{ color: "var(--ai)" }} />
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Screening verdict</span>
              <Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">candidate-screener · ReAct</Pill>
            </div>
            <div style={{ width: 200 }}><Confidence value={0.61} /></div>
          </div>
          <div>
            {reqRows.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px 110px", gap: 12, alignItems: "center",
                padding: "11px 16px", borderTop: i ? "1px solid var(--line)" : "none", background: "var(--surface)" }}>
                <div style={{ display: "grid", placeItems: "center" }}>
                  <Icon name={r.state === "pass" ? "check" : r.state === "review" ? "eye" : "x"} size={16} stroke={2.2}
                    style={{ color: r.state === "pass" ? "var(--ok)" : r.state === "review" ? "var(--warn)" : "var(--danger)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 7, alignItems: "center" }}>
                    {r.label}
                    {r.custom && <Pill tone="var(--ink-3)" bg="var(--surface-3)" style={{ fontSize: 10, padding: "1px 7px" }}>custom field</Pill>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{r.note}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>{r.weight}% wt</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><StatusBadge kind={r.state} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
window.FoundationsPage = FoundationsPage;
