"use client";
// components/shared/scene-art.tsx
// Cohesive, on-brand animated SVG "scenes" for empty states / spare page areas.
// Pure SVG + scoped CSS keyframes (class prefix .sa-). Brand palette: green
// (#16a37a), AI violet (#7c5cff), blue (#5588fb). All motion is wrapped in
// @media (prefers-reduced-motion: no-preference) so it respects the OS setting.
import * as React from "react";

const GREEN = "#16a37a";
const VIOLET = "#7c5cff";
const BLUE = "#5588fb";
const INK3 = "var(--c-ink-3, #8b93a7)";

const STYLE = `
.sa-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;}
.sa-svg{width:100%;max-width:var(--sa-max,460px);height:auto;display:block;overflow:visible;}
.sa-svg [data-spin],.sa-svg [data-orbit],.sa-svg [data-tilt],.sa-svg [data-ping],.sa-svg [data-pulse],.sa-svg [data-float],.sa-svg [data-scan],.sa-svg [data-draw],.sa-svg [data-dash]{transform-box:fill-box;transform-origin:center;}
.sa-title{margin:18px 0 0;font-size:var(--fs-lg,17px);font-weight:700;letter-spacing:-0.01em;color:var(--c-ink,#16203a);}
.sa-body{margin:6px auto 0;max-width:42ch;font-size:var(--fs-sm,13.5px);line-height:1.6;color:var(--c-ink-2,#5b647a);}
@media (prefers-reduced-motion: no-preference){
  .sa-svg [data-spin]{animation:sa-spin 14s linear infinite;}
  .sa-svg [data-spin-rev]{animation:sa-spin 22s linear infinite reverse;}
  .sa-svg [data-orbit]{animation:sa-spin 18s linear infinite;}
  .sa-svg [data-tilt]{animation:sa-tilt 5.5s ease-in-out infinite;}
  .sa-svg [data-ping]{animation:sa-ping 3.4s ease-out infinite;}
  .sa-svg [data-pulse]{animation:sa-pulse 2.6s ease-in-out infinite;}
  .sa-svg [data-float]{animation:sa-float 5s ease-in-out infinite;}
  .sa-svg [data-scan]{animation:sa-scan 3.6s ease-in-out infinite;}
  .sa-svg [data-draw]{stroke-dasharray:var(--len,60);stroke-dashoffset:var(--len,60);animation:sa-draw 2.2s ease-out 0.6s forwards;}
  .sa-svg [data-dash]{stroke-dasharray:5 7;animation:sa-dash 1.1s linear infinite;}
}
@keyframes sa-spin{to{transform:rotate(360deg);}}
@keyframes sa-tilt{0%,100%{transform:rotate(-3.5deg);}50%{transform:rotate(3.5deg);}}
@keyframes sa-ping{0%{transform:scale(.35);opacity:.65;}80%{opacity:0;}100%{transform:scale(1.7);opacity:0;}}
@keyframes sa-pulse{0%,100%{opacity:.35;}50%{opacity:1;}}
@keyframes sa-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
@keyframes sa-scan{0%{transform:translateY(-26px);opacity:0;}18%,82%{opacity:.9;}100%{transform:translateY(26px);opacity:0;}}
@keyframes sa-draw{to{stroke-dashoffset:0;}}
@keyframes sa-dash{to{stroke-dashoffset:-24;}}
`;

function Defs() {
  return (
    <defs>
      <linearGradient id="sa-g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={GREEN} /><stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <linearGradient id="sa-g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={VIOLET} /><stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <radialGradient id="sa-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={GREEN} stopOpacity="0.28" /><stop offset="1" stopColor={GREEN} stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sa-glow2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={VIOLET} stopOpacity="0.26" /><stop offset="1" stopColor={VIOLET} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sa-sweep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={GREEN} stopOpacity="0" /><stop offset="1" stopColor={GREEN} stopOpacity="0.5" />
      </linearGradient>
    </defs>
  );
}

/* ---------- Radar / sourcing: rings ping out, a sweep rotates, candidate dots glow ---------- */
function Radar() {
  const dots = [[150, 70], [212, 128], [96, 150], [188, 196], [120, 210], [232, 92]] as const;
  return (
    <svg className="sa-svg" viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <Defs />
      <circle cx="160" cy="140" r="120" fill="url(#sa-glow)" />
      {[40, 72, 104].map((r) => (
        <circle key={r} cx="160" cy="140" r={r} stroke={GREEN} strokeOpacity="0.18" />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="160" cy="140" r="44" stroke={GREEN} strokeOpacity="0.5" data-ping style={{ animationDelay: `${i * 1.1}s` }} />
      ))}
      {/* rotating sweep wedge */}
      <g data-spin>
        <path d="M160 140 L160 24 A116 116 0 0 1 262 92 Z" fill="url(#sa-sweep)" opacity="0.5" />
        <line x1="160" y1="140" x2="160" y2="24" stroke={GREEN} strokeWidth="1.5" strokeOpacity="0.7" />
      </g>
      {/* candidate dots */}
      {dots.map(([x, y], i) => (
        <g key={i}>
          <line x1="160" y1="140" x2={x} y2={y} stroke={BLUE} strokeOpacity="0.16" />
          <circle cx={x} cy={y} r="5.5" fill={i % 2 ? VIOLET : GREEN} data-pulse style={{ animationDelay: `${i * 0.4}s` }} />
        </g>
      ))}
      {/* center node */}
      <circle cx="160" cy="140" r="11" fill="url(#sa-g1)" data-float />
      <circle cx="160" cy="140" r="11" stroke="#fff" strokeOpacity="0.6" />
    </svg>
  );
}

/* ---------- Shield / security: aura pulses, a scan line sweeps, a check draws in ---------- */
function Shield() {
  const shield = "M160 40 L250 74 V150 C250 200 210 232 160 248 C110 232 70 200 70 150 V74 Z";
  return (
    <svg className="sa-svg" viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <Defs />
      <circle cx="160" cy="150" r="120" fill="url(#sa-glow)" />
      {[0, 1].map((i) => (
        <path key={i} d={shield} stroke={GREEN} strokeOpacity="0.4" data-ping style={{ animationDelay: `${i * 1.6}s` }} />
      ))}
      <path d={shield} fill={GREEN} fillOpacity="0.06" stroke="url(#sa-g1)" strokeWidth="2.5" />
      <clipPath id="sa-shclip"><path d={shield} /></clipPath>
      <g clipPath="url(#sa-shclip)">
        <rect x="70" y="140" width="180" height="10" fill={GREEN} fillOpacity="0.55" data-scan />
        {[96, 124, 152, 180, 208].map((y) => <line key={y} x1="86" y1={y} x2="234" y2={y} stroke={GREEN} strokeOpacity="0.08" />)}
      </g>
      {/* check mark drawing in */}
      <path d="M126 150 L150 176 L198 120" stroke="url(#sa-g1)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" data-draw style={{ "--len": 110 } as React.CSSProperties} />
      {/* floating spark particles */}
      {[[96, 96], [228, 110], [110, 210], [220, 196]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={i % 2 ? VIOLET : BLUE} data-float style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </svg>
  );
}

/* ---------- Compliance: balanced scales gently tilt, check-circles light up in sequence ---------- */
function Compliance() {
  return (
    <svg className="sa-svg" viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <Defs />
      <circle cx="160" cy="140" r="118" fill="url(#sa-glow)" />
      {/* dotted check constellation */}
      {[[70, 60], [248, 76], [60, 196], [256, 200], [160, 38]].map(([x, y], i) => (
        <g key={i} data-pulse style={{ animationDelay: `${i * 0.5}s` }}>
          <circle cx={x} cy={y} r="10" stroke={i % 2 ? VIOLET : GREEN} strokeOpacity="0.6" />
          <path d={`M${x - 4} ${y} l3 3 l6 -7`} stroke={i % 2 ? VIOLET : GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {/* scales */}
      <line x1="160" y1="92" x2="160" y2="220" stroke={INK3} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="160" cy="86" r="9" fill="url(#sa-g1)" />
      <rect x="120" y="216" width="80" height="9" rx="4" fill={INK3} opacity="0.5" />
      <g data-tilt>
        <line x1="96" y1="96" x2="224" y2="96" stroke="url(#sa-g1)" strokeWidth="4" strokeLinecap="round" />
        {([96, 224] as const).map((x, i) => (
          <g key={i}>
            <line x1={x} y1="96" x2={x - 22} y2="138" stroke={INK3} strokeOpacity="0.5" />
            <line x1={x} y1="96" x2={x + 22} y2="138" stroke={INK3} strokeOpacity="0.5" />
            <path d={`M${x - 26} 138 A26 26 0 0 0 ${x + 26} 138 Z`} fill={i ? VIOLET : GREEN} fillOpacity="0.14" stroke={i ? VIOLET : GREEN} strokeOpacity="0.7" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- Interviews: a calendar/clock with avatars orbiting + flowing connections ---------- */
function Interview() {
  return (
    <svg className="sa-svg" viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <Defs />
      <circle cx="160" cy="140" r="118" fill="url(#sa-glow2)" />
      {/* connecting flow ring */}
      <circle cx="160" cy="140" r="86" stroke={VIOLET} strokeOpacity="0.4" data-dash />
      <circle cx="160" cy="140" r="86" stroke={VIOLET} strokeOpacity="0.1" />
      {/* center calendar/clock */}
      <rect x="128" y="110" width="64" height="60" rx="10" fill={GREEN} fillOpacity="0.08" stroke="url(#sa-g1)" strokeWidth="2.5" />
      <line x1="128" y1="126" x2="192" y2="126" stroke="url(#sa-g1)" strokeWidth="2" />
      <circle cx="160" cy="148" r="13" stroke={GREEN} strokeWidth="2" />
      <line x1="160" y1="148" x2="160" y2="140" stroke={GREEN} strokeWidth="2" strokeLinecap="round" data-spin />
      <line x1="160" y1="148" x2="167" y2="148" stroke={GREEN} strokeWidth="2" strokeLinecap="round" data-spin-rev />
      {/* orbiting panel avatars */}
      <g data-orbit>
        {([[160, 54, GREEN, "AC"], [252, 192, VIOLET, "SO"], [68, 192, BLUE, "LW"]] as const).map(([cx, cy, col, t], i) => (
          <g key={i} data-spin-rev>
            <circle cx={cx} cy={cy} r="16" fill={col} fillOpacity="0.16" stroke={col} strokeWidth="1.5" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={col} fontFamily="var(--font-sans, sans-serif)">{t}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const SCENES: Record<string, () => React.ReactElement> = { radar: Radar, shield: Shield, compliance: Compliance, interview: Interview };

export function SceneArt({
  scene, title, body, maxWidth = 460, className, children,
}: {
  scene: "radar" | "shield" | "compliance" | "interview";
  title?: string; body?: string; maxWidth?: number; className?: string; children?: React.ReactNode;
}) {
  const S = SCENES[scene] ?? Radar;
  return (
    <div className={"sa-wrap" + (className ? " " + className : "")} style={{ ["--sa-max" as any]: `${maxWidth}px` }}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <S />
      {title && <div className="sa-title">{title}</div>}
      {body && <div className="sa-body">{body}</div>}
      {children}
    </div>
  );
}
