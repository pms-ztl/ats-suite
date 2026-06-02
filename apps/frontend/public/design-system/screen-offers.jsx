/* screen-offers.jsx, Offers list + offer-letter composer (AI-drafted, human-approved) */
const { useState: uSof } = React;
const OF = window.UI;
const money = (n) => "$" + n.toLocaleString();

function OffersList({ onOpen }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{window.OFFERS.filter(o => o.status === "draft").length} drafts · {window.OFFERS.filter(o => o.status === "pending").length} awaiting approval · {window.OFFERS.filter(o => o.status === "sent").length} sent.</p></div>
          <OF.Btn variant="primary" icon="plus" onClick={onOpen}>Create offer</OF.Btn>
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <span>Candidate</span><span>Requisition</span><span>Base salary</span><span>Status</span><span style={{ textAlign: "right" }}>Expires</span>
          </div>
          {window.OFFERS.map((o, i) => {
            const st = window.OFFER_STATUS[o.status];
            return (
              <div key={o.id} onClick={onOpen} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", transition: "background var(--t-fast)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <span className="mono" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white" }}>{o.ini}</span>
                  <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{o.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.role}</div></div>
                </div>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{o.reqId}</span>
                <span className="mono tnum" style={{ fontSize: 13.5, fontWeight: 600 }}>{money(o.base)}</span>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99, justifySelf: "start" }}><Icon name={st.icon} size={11} />{st.label}</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "right" }}>{o.expires}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompRow({ k, v, sub, big }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: big ? "12px 0" : "8px 0", borderTop: "1px solid var(--line)" }}>
    <span style={{ fontSize: big ? "var(--fs-sm)" : 12.5, fontWeight: big ? 700 : 500, color: big ? "var(--ink)" : "var(--ink-2)" }}>{k}{sub && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}> · {sub}</span>}</span>
    <span className="mono tnum" style={{ fontSize: big ? 18 : 13, fontWeight: big ? 700 : 600, color: big ? "var(--brand)" : "var(--ink)" }}>{v}</span>
  </div>;
}

function Composer({ onBack }) {
  const d = window.OFFER_DETAIL;
  const [status, setStatus] = uSof("draft");
  const c = d.comp, b = d.band;
  const bandPct = (v) => ((v - b.min) / (b.max - b.min)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", borderBottom: "1px solid var(--line)" }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevsL" size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Offer · {d.name}</h1>
            <OF.Pill icon={window.OFFER_STATUS[status].icon} tone={window.OFFER_STATUS[status].tone} bg={window.OFFER_STATUS[status].bg}>{window.OFFER_STATUS[status].label}</OF.Pill></div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{d.role} · {d.level} · <span className="mono">{d.reqId}</span></div>
        </div>
        <OF.Btn variant="ghost">Save draft</OF.Btn>
        {status === "draft" && <OF.Btn variant="primary" icon="check" onClick={() => setStatus("pending")}>Submit for approval</OF.Btn>}
        {status === "pending" && <OF.Btn variant="primary" icon="check" onClick={() => setStatus("approved")}>Approve</OF.Btn>}
        {status === "approved" && <OF.Btn variant="primary" icon="arrowUpRight" onClick={() => setStatus("sent")}>Send to candidate</OF.Btn>}
        {status === "sent" && <OF.Pill icon="clock" tone="var(--info)" bg="var(--info-tint)">awaiting candidate</OF.Pill>}
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", minHeight: 0 }}>
        {/* editor */}
        <div style={{ overflowY: "auto", padding: "22px 28px 50px", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* AI draft banner */}
          <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--ai)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>Drafted by the offer agent · positioned at the {d.ai.bandPosition}</div><div style={{ fontSize: 12, color: "var(--ink-2)" }}>Every field is editable. A human approves before anything is sent.</div></div>
            <OF.Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">conf {d.ai.confidence.toFixed(2)}</OF.Pill>
          </div>

          {/* comp breakdown */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3><OF.Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">within band</OF.Pill></div>
            <CompRow k="Base salary" v={money(c.base)} big />
            <CompRow k="Signing bonus" v={money(c.signing)} />
            <CompRow k="Annual bonus target" v={Math.round(c.annualBonus*100) + "%"} sub={money(c.base*c.annualBonus)} />
            <CompRow k="Equity" v={c.equity} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 2px", marginTop: 6, borderTop: "2px solid var(--line-strong)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Year-one total</span><span className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--brand)" }}>{money(c.total)}</span>
            </div>

            {/* band positioning */}
            <div style={{ marginTop: 18 }}>
              <div style={{ ...OF.fStyles.label, marginBottom: 10 }}>Base vs band &amp; market</div>
              <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(90deg, var(--surface-3), var(--brand-tint-2))", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: bandPct(b.market.p50) + "%", top: -3, bottom: -3, width: 1.5, background: "var(--ink-3)" }} title="Market p50" />
                <div style={{ position: "absolute", left: "calc(" + bandPct(c.base) + "% - 8px)", top: -3, width: 16, height: 16, borderRadius: 99, background: "var(--brand)", border: "2px solid var(--surface)", boxShadow: "var(--e1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)" }} className="mono"><span>{money(b.min)}</span><span>mid {money(b.mid)}</span><span>{money(b.max)}</span></div>
            </div>
          </div>

          {/* justification */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...OF.fStyles.label, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="sparkles" size={13} style={{ color: "var(--ai)" }} /> Justification · editable</div>
            <textarea defaultValue={d.justification} rows={4} style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
          </div>
        </div>

        {/* approval + preview rail */}
        <div style={{ overflowY: "auto", padding: "22px 22px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* approval chain */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...OF.fStyles.label, marginBottom: 12 }}>Approval chain</div>
            {d.approvalChain.map((a, i) => {
              const eff = status === "approved" || status === "sent" ? "done" : status === "pending" && i === 1 ? "current" : a.status;
              const tone = eff === "done" ? "var(--ok)" : eff === "current" ? "var(--warn)" : "var(--ink-3)";
              return (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", paddingBottom: i < d.approvalChain.length - 1 ? 14 : 0, position: "relative" }}>
                  {i < d.approvalChain.length - 1 && <span style={{ position: "absolute", left: 13, top: 28, height: "calc(100% - 24px)", width: 2, background: "var(--line)" }} />}
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", zIndex: 1, background: eff === "pending" ? "var(--surface-2)" : "color-mix(in oklab," + tone + " 14%, transparent)", color: tone, border: "1px solid " + (eff === "pending" ? "var(--line)" : "transparent") }}><Icon name={eff === "done" ? "check" : eff === "current" ? "clock" : "dot"} size={14} stroke={2.3} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.role}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{a.who}</div></div>
                  <OF.Pill tone={tone} bg={eff === "pending" ? "var(--surface-2)" : "color-mix(in oklab," + tone + " 13%, transparent)"} style={{ fontSize: 10 }}>{eff === "current" ? "needs review" : eff}</OF.Pill>
                </div>
              );
            })}
          </div>

          {/* letter preview */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...OF.fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Letter preview</span><OF.Pill mono tone="var(--ink-3)">PDF</OF.Pill></div>
            <div style={{ padding: "20px 22px", fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}><Logo size={22} /><b style={{ color: "var(--ink)" }}>Northwind Talent</b></div>
              <p style={{ margin: "0 0 12px" }}>Dear {d.name},</p>
              <p style={{ margin: "0 0 12px" }}>We're delighted to offer you the role of <b style={{ color: "var(--ink)" }}>{d.role}</b> ({d.level}) on the Payments Platform team, starting <b style={{ color: "var(--ink)" }}>{d.start}</b>.</p>
              <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--surface-2)", margin: "0 0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--ink)" }}><span>Base salary</span><span className="mono">{money(c.base)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Signing bonus</span><span className="mono">{money(c.signing)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Equity</span><span className="mono">{c.equity}</span></div>
              </div>
              <p style={{ margin: "0 0 6px" }}>This offer expires in {d.expiresInDays} days. We can't wait to build with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OffersScreen() {
  const [view, setView] = uSof("list");
  return view === "composer" ? <Composer onBack={() => setView("list")} /> : <OffersList onOpen={() => setView("composer")} />;
}
window.OffersScreen = OffersScreen;
