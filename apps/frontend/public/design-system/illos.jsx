/* illos.jsx, signature duotone illustrations (one grammar: 2px stroke, emerald→violet) */
(function(){
const SVG = {
  /* hiring pipeline, requisitions, sourcing, scheduling, generic empty */
  pipeline:
    '<svg class="illo" width="180" height="130" viewBox="0 0 180 130" fill="none" aria-hidden="true">'
    +'<line x1="38" y1="65" x2="142" y2="65" stroke="var(--line-strong)" stroke-width="2" class="da"/>'
    +'<rect x="18" y="48" width="38" height="34" rx="9" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2"/>'
    +'<rect x="71" y="42" width="38" height="46" rx="9" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="2"/>'
    +'<rect x="124" y="50" width="38" height="30" rx="9" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2" class="fl"/>'
    +'<path d="M30 60h14M30 68h9" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<path d="M83 54h14M83 62h14M83 70h8" stroke="var(--ink-3)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<path d="M136 60h14M136 68h9" stroke="var(--ai)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<circle cx="37" cy="65" r="4" fill="var(--brand)"/><circle cx="143" cy="65" r="4" fill="var(--ai)" class="pu"/>'
    +'<circle cx="90" cy="28" r="3" fill="var(--brand)" class="fl"/></svg>',
  /* agent constellation, AI ops, copilot, sourcing */
  constellation:
    '<svg class="illo" width="170" height="132" viewBox="0 0 170 132" fill="none" aria-hidden="true">'
    +'<g class="ob" style="transform-origin:85px 66px">'
    +'<line x1="85" y1="66" x2="38" y2="34" stroke="var(--ai)" stroke-width="1.5" opacity=".4"/>'
    +'<line x1="85" y1="66" x2="134" y2="42" stroke="var(--ai)" stroke-width="1.5" opacity=".4"/>'
    +'<line x1="85" y1="66" x2="120" y2="102" stroke="var(--ai)" stroke-width="1.5" opacity=".4"/>'
    +'<line x1="85" y1="66" x2="44" y2="98" stroke="var(--ai)" stroke-width="1.5" opacity=".4"/>'
    +'<circle cx="38" cy="34" r="6" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2"/>'
    +'<circle cx="134" cy="42" r="6" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2"/>'
    +'<circle cx="120" cy="102" r="6" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2"/>'
    +'<circle cx="44" cy="98" r="6" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2"/></g>'
    +'<circle cx="85" cy="66" r="17" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2" class="pu"/>'
    +'<path d="M85 58l1.8 4.8L92 64l-4.8 1.8L85 71l-1.8-4.8L78 64l4.8-1.4z" fill="var(--ai)"/></svg>',
  /* evidence found, screening, search results */
  evidence:
    '<svg class="illo" width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">'
    +'<rect x="44" y="22" width="74" height="82" rx="11" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="2" class="fl"/>'
    +'<path d="M58 44h46M58 56h32M58 68h38M58 80h28" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<circle cx="104" cy="84" r="20" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2.4" class="pu"/>'
    +'<path d="M96 84l5 5 9-10" stroke="var(--ai)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    +'<path d="M118 98l9 9" stroke="var(--ai)" stroke-width="2.6" stroke-linecap="round"/></svg>',
  /* human decides, HITL, decisions, trust */
  human:
    '<svg class="illo" width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">'
    +'<path d="M80 24l36 13v23c0 23-16 35-36 43-20-8-36-20-36-43V37z" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2.4" class="fl"/>'
    +'<circle cx="80" cy="58" r="10" fill="var(--surface)" stroke="var(--brand)" stroke-width="2.2"/>'
    +'<path d="M64 84c0-9 7-15 16-15s16 6 16 15" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round" fill="none"/>'
    +'<circle cx="116" cy="34" r="10" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2" class="pu"/>'
    +'<path d="M116 29l1.2 3 3 .3-2.2 2 .6 3-2.6-1.5-2.6 1.5.6-3-2.2-2 3-.3z" fill="var(--ai)"/></svg>',
  /* people / team, team, mobility */
  people:
    '<svg class="illo" width="170" height="128" viewBox="0 0 170 128" fill="none" aria-hidden="true">'
    +'<circle cx="62" cy="50" r="16" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2.2" class="fl"/>'
    +'<path d="M36 96c0-15 11-24 26-24s26 9 26 24" stroke="var(--brand)" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    +'<circle cx="116" cy="44" r="13" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2.2"/>'
    +'<path d="M96 86c0-12 9-19 20-19s20 7 20 19" stroke="var(--ai)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/>'
    +'<path d="M62 41l1.4 3.4 3.6.3-2.7 2.4.8 3.5-3.1-1.9-3.1 1.9.8-3.5-2.7-2.4 3.6-.3z" fill="var(--brand)"/></svg>',
  /* documents / postings, job postings, offers, forms */
  documents:
    '<svg class="illo" width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">'
    +'<rect x="40" y="34" width="62" height="78" rx="10" fill="var(--surface-3)" stroke="var(--line-strong)" stroke-width="2" opacity=".7"/>'
    +'<rect x="54" y="24" width="62" height="78" rx="10" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="2" class="fl"/>'
    +'<path d="M68 44h34M68 56h34M68 68h22" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<circle cx="100" cy="84" r="16" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2.2" class="pu"/>'
    +'<path d="M94 84l4 4 7-8" stroke="var(--ai)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  /* shield / compliance, compliance, security, audit */
  shield:
    '<svg class="illo" width="150" height="130" viewBox="0 0 150 130" fill="none" aria-hidden="true">'
    +'<path d="M75 22l38 14v24c0 24-17 37-38 46-21-9-38-22-38-46V36z" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="2.4" class="fl"/>'
    +'<path d="M60 64l11 11 22-24" stroke="var(--brand)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    +'<circle cx="112" cy="34" r="9" fill="var(--ai-tint)" stroke="var(--ai)" stroke-width="2" class="pu"/></svg>',
  /* off the map, 404, offline, generic empty */
  offmap:
    '<svg class="illo" width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">'
    +'<circle cx="80" cy="64" r="42" fill="var(--surface-3)" opacity=".5"/>'
    +'<g class="fl"><rect x="54" y="40" width="52" height="46" rx="12" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="2"/>'
    +'<circle cx="70" cy="60" r="4" fill="var(--brand)"/><circle cx="90" cy="60" r="4" fill="var(--brand)"/>'
    +'<path d="M68 74c4-4 20-4 24 0" stroke="var(--ink-3)" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>'
    +'<circle cx="120" cy="38" r="3.5" fill="var(--ai)" class="pu"/><circle cx="36" cy="92" r="3" fill="var(--brand)" opacity=".6"/></svg>',
};
/* route → illustration mapping */
const ROUTE = {
  sourcing: "constellation", jobpost: "documents", jobs: "documents", copilot: "constellation",
  ai: "constellation", mobility: "people", team: "people", compliance: "shield",
  security: "shield", audit: "shield", requisitions: "pipeline", scheduling: "pipeline",
  screening: "evidence", hitl: "human", decisions: "human", offers: "documents",
  integrations: "constellation", billing: "documents", notifications: "offmap",
};
function Illo({ name, route, style }) {
  const key = name || ROUTE[route] || "pipeline";
  return React.createElement("span", { style: { display: "inline-flex", ...style }, dangerouslySetInnerHTML: { __html: SVG[key] || SVG.pipeline } });
}
window.Illo = Illo; window.ILLO_SVG = SVG; window.ILLO_ROUTE = ROUTE;
})();
