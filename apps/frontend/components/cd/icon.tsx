// components/icon.tsx
// The full Aurora icon set + Logo, ported verbatim from icons.jsx.
// 24px stroke geometry, Lucide-style. Pure presentational, no state.
import * as React from "react";

export const ICONS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5M20 20v-1.4a3.5 3.5 0 0 0-2.6-3.38M15 5.2a3.25 3.25 0 0 1 0 6.1",
  briefcase: "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18",
  radar: "M12 12 16 8M12 3a9 9 0 1 0 9 9M12 7.5a4.5 4.5 0 1 0 4.5 4.5M21 5l-2.5 2.5",
  scan: "M5 8V6a1 1 0 0 1 1-1h2M16 5h2a1 1 0 0 1 1 1v2M19 16v2a1 1 0 0 1-1 1h-2M8 19H6a1 1 0 0 1-1-1v-2M8.5 12l2.2 2.2 4.8-4.8",
  calendar: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5zM4 9.5h16M8 3.5v3M16 3.5v3",
  gavel: "m14.5 12.5-7 7M5 18l1.5 1.5M9.5 7.5l5 5M13 4l7 7-2.5 2.5-7-7zM3 21h7",
  fileText: "M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M8.5 13h7M8.5 16.5h7",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4zM18 14l.7 1.8L20.5 16.5l-1.8.7L18 19l-.7-1.8L15.5 16.5l1.8-.7z",
  listChecks: "M10 6h10M10 12h10M10 18h10M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  cpu: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2",
  chart: "M4 20V4M4 20h16M8 16v-4M12.5 16V8M17 16v-7",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  scroll: "M6 4h11a1 1 0 0 1 1 1v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2zM6 4a2 2 0 0 0-2 2v2h2M10 9h5M10 13h5",
  userCog: "M9 11.5A3.25 3.25 0 1 0 9 5a3.25 3.25 0 0 0 0 6.5M4 20v-1.5A3.5 3.5 0 0 1 7.5 15H10M17 14v1M17 21v1M20.5 16l-.9.5M14.4 19.5l-.9.5M20.5 20l-.9-.5M14.4 16.5l-.9-.5M17 19.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5z",
  plug: "M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18M7 14h4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V19a2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 12 2 2 0 1 1 5 9.5a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 12 4.6 2 2 0 1 1 14.5 5a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 13z",
  lifebuoy: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6.3 6.3l3.5 3.5M14.2 14.2l3.5 3.5M17.7 6.3l-3.5 3.5M9.8 14.2l-3.5 3.5",
  mobility: "M6 4v10a3 3 0 0 0 3 3h6M6 4 3 7M6 4l3 3M18 20V10a3 3 0 0 0-3-3H9M18 20l3-3M18 20l-3-3",
  server: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-13A1.5 1.5 0 0 1 4 8.5zM4 15.5A1.5 1.5 0 0 1 5.5 14h13a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM7.5 7h.01M7.5 17h.01",
  terminal: "M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 9l3 2.5L8 14M13 15h4",
  rocket: "M12 3c3 1 5 4 5 8l-2.5 2.5h-5L7 11c0-4 2-7 5-8ZM12 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.5 16l-1.7 1.7a2 2 0 0 0 .8 3.3M14.5 16l1.7 1.7a2 2 0 0 1-.8 3.3",
  building: "M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3",
  inbox: "M4 13l2.5-7A1.5 1.5 0 0 1 8 5h8a1.5 1.5 0 0 1 1.5 1L20 13v4.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5zM4 13h4l1.5 2.5h5L16 13h4",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 1.5 6.5 1.5 6.5h-15S6 14 6 9zM10 19a2 2 0 0 0 4 0",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  command: "M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  chevExpand: "M8 9l4-4 4 4M8 15l4 4 4-4",
  chevsL: "M11 7l-5 5 5 5M18 7l-5 5 5 5",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  dot: "M12 12h.01",
  enter: "M9 10l-4 4 4 4M5 14h10a4 4 0 0 0 4-4V6",
  logout: "M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 16l4-4-4-4M20 12H9",
  bolt: "M13 3 5 13h5l-1 8 8-10h-5z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  flag: "M5 21V4M5 4h11l-2 3 2 3H5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  copy: "M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  swatch: "M5 19a2 2 0 0 0 2 2 2 2 0 0 0 2-2V6a2 2 0 0 0-4 0zM9 13l4-4 6 6M7 19h11a2 2 0 0 0 2-2v-3",
  type: "M5 6h14M5 6V4.5M9 6v13M9 19H7M9 19h2M15 9.5h4M15 9.5V8.5M17 9.5v9.5M17 19h-1.5M17 19h1.5",
  layers: "M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  motion: "M3 12h4l2-6 4 14 2-8h6",
  shapes: "M12 4l3.5 6H8.5zM5 14h6v6H5zM18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

export type IconName = keyof typeof ICONS | string;

export function Icon({
  name, size = 18, stroke = 1.7, className = "", style = {}, fill = "none",
}: {
  name: IconName; size?: number; stroke?: number; className?: string;
  style?: React.CSSProperties; fill?: string;
}) {
  const d = ICONS[name as string];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">
      {d ? <path d={d} /> : null}
    </svg>
  );
}

// Brand mark, overlapping aperture leaves (matches icons.jsx Logo geometry).
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" />
      <path d="M8.5 23.5L16 7l7.5 16.5" stroke="var(--on-brand)" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16.5h8" stroke="var(--on-brand)" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="16" cy="6.2" r="2.2" fill="#9b8cff" />
    </svg>
  );
}
