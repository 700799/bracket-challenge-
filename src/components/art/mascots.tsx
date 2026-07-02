import * as React from "react";

/**
 * Original "Kart Hero" mascots — racing-helmet heroes in a bold sticker style
 * (thick ink outlines, glossy lenses, primary palette). These are hand-drawn
 * SVGs inspired by kart-racing art, not any copyrighted character.
 */

export type MascotVariant = "red" | "blue" | "green" | "gold" | "purple";

interface Palette {
  cap: string;
  suit: string;
  suitDark: string;
  accent: string;
}

export const MASCOT_PALETTE: Record<MascotVariant, Palette> = {
  red: { cap: "#E5322D", suit: "#E5322D", suitDark: "#B31F1B", accent: "#F5C518" },
  blue: { cap: "#1B4DE4", suit: "#1B4DE4", suitDark: "#123BB0", accent: "#F5C518" },
  green: { cap: "#33C14E", suit: "#33C14E", suitDark: "#1F9A38", accent: "#0A0A12" },
  gold: { cap: "#F5C518", suit: "#F5C518", suitDark: "#D19E00", accent: "#0A0A12" },
  purple: { cap: "#7A3CF0", suit: "#7A3CF0", suitDark: "#5A24C2", accent: "#F5C518" },
};

export const MASCOT_VARIANTS: MascotVariant[] = [
  "red",
  "blue",
  "green",
  "gold",
  "purple",
];

const INK = "#0A0A12";
const SKIN = "#F2C9A0";
const LENS = "#8FD3FF";

interface ArtProps {
  variant?: MascotVariant;
  className?: string;
  title?: string;
}

/** Bust of a helmeted racing hero — used as the player avatar. */
export function HeroMascot({ variant = "red", className, title }: ArtProps) {
  const p = MASCOT_PALETTE[variant];
  return (
    <svg viewBox="0 0 128 128" className={className} role="img" aria-label={title ?? "Kart hero"}>
      {title ? <title>{title}</title> : null}
      {/* neck + shoulders */}
      <path d="M40 104c0-14 10-22 24-22s24 8 24 22v16H40z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M52 96h24v14H52z" fill={SKIN} stroke={INK} strokeWidth={4} />
      {/* head */}
      <ellipse cx="64" cy="60" rx="34" ry="36" fill={SKIN} stroke={INK} strokeWidth={5} />
      {/* helmet dome */}
      <path d="M30 58c0-22 15-38 34-38s34 16 34 38c0 6-2 10-2 10H32s-2-4-2-10z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* red cap peeking above helmet */}
      <path d="M46 24c8-9 28-9 36 0-6-3-30-3-36 0z" fill={p.cap} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* goggle band */}
      <rect x="30" y="52" width="68" height="12" rx="4" fill={INK} />
      {/* goggle lenses */}
      <circle cx="50" cy="58" r="11" fill={LENS} stroke={INK} strokeWidth={4} />
      <circle cx="82" cy="58" r="11" fill={LENS} stroke={INK} strokeWidth={4} />
      <circle cx="46" cy="54" r="3.5" fill="#fff" opacity="0.9" />
      <circle cx="78" cy="54" r="3.5" fill="#fff" opacity="0.9" />
      {/* smile */}
      <path d="M52 80c6 8 18 8 24 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {/* chin strap */}
      <path d="M34 66c4 14 12 22 30 22s26-8 30-22" fill="none" stroke={INK} strokeWidth={4} />
      {/* accent star on suit */}
      <path d="M64 108l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={p.accent} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

/** A hero sprinting — used in the hero banner. */
export function HeroRunning({ variant = "blue", className, title }: ArtProps) {
  const p = MASCOT_PALETTE[variant];
  return (
    <svg viewBox="0 0 128 128" className={className} role="img" aria-label={title ?? "Running hero"}>
      {title ? <title>{title}</title> : null}
      {/* back leg */}
      <path d="M60 74l-18 26 12 8 18-24z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx="52" cy="106" rx="10" ry="6" fill={INK} />
      {/* front leg */}
      <path d="M70 74l16 20-4 14-18-10z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx="84" cy="106" rx="10" ry="6" fill={INK} />
      {/* torso */}
      <path d="M52 44c10-6 22-6 30 2 6 6 6 22-2 30-8 6-24 6-30-4-5-9-6-22 2-28z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* arms pumping */}
      <path d="M52 54l-16 6 4 12 16-8z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M82 52l16-4 2 12-16 6z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* head + helmet */}
      <circle cx="74" cy="30" r="20" fill={SKIN} stroke={INK} strokeWidth={5} />
      <path d="M55 30c0-13 9-22 20-22s20 9 20 22c0 3-1 6-1 6H56s-1-3-1-6z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x="56" y="26" width="38" height="8" rx="3" fill={INK} />
      <circle cx="86" cy="30" r="7" fill={LENS} stroke={INK} strokeWidth={3} />
      <path d="M66 40c4 4 10 4 14 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      {/* speed lines */}
      <path d="M20 46h16M14 58h14M22 70h12" stroke={p.accent} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** A hero striking a soccer ball. */
export function HeroKicking({ variant = "green", className, title }: ArtProps) {
  const p = MASCOT_PALETTE[variant];
  return (
    <svg viewBox="0 0 140 128" className={className} role="img" aria-label={title ?? "Hero kicking a ball"}>
      {title ? <title>{title}</title> : null}
      {/* planted leg */}
      <path d="M56 72l-6 30 12 2 6-28z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx="58" cy="106" rx="11" ry="6" fill={INK} />
      {/* kicking leg */}
      <path d="M66 72c10 0 22 6 30 16l-8 10c-8-8-18-12-26-12z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx="96" cy="96" rx="11" ry="7" fill={INK} transform="rotate(20 96 96)" />
      {/* torso */}
      <path d="M46 40c10-6 22-6 30 2 6 8 4 24-4 30-9 6-24 5-30-5-4-9-4-21 4-27z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* arms out for balance */}
      <path d="M46 50L28 44l-2 12 18 6z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M74 46l16-8 6 10-16 10z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* head + helmet */}
      <circle cx="58" cy="28" r="19" fill={SKIN} stroke={INK} strokeWidth={5} />
      <path d="M40 28c0-12 8-21 19-21s19 9 19 21c0 3-1 5-1 5H41s-1-2-1-5z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x="41" y="24" width="36" height="8" rx="3" fill={INK} />
      <circle cx="50" cy="28" r="7" fill={LENS} stroke={INK} strokeWidth={3} />
      <path d="M50 40c4 3 9 3 13 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      {/* the ball being struck */}
      <SoccerBall className="" x={104} y={82} size={30} />
      <path d="M120 70l8-6M126 84h9M120 98l7 5" stroke={p.accent} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** A diving goalkeeper hero. */
export function HeroGoalie({ variant = "gold", className, title }: ArtProps) {
  const p = MASCOT_PALETTE[variant];
  return (
    <svg viewBox="0 0 140 128" className={className} role="img" aria-label={title ?? "Goalkeeper hero"}>
      {title ? <title>{title}</title> : null}
      {/* legs mid-dive */}
      <path d="M44 70l-22 8 4 12 24-8z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M50 74l-6 26 12 2 6-24z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* torso leaning */}
      <path d="M48 40c10-6 24-6 30 4 5 8 3 22-6 28-9 5-23 3-28-7-4-9-4-19 4-25z" fill={p.suit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* stretched arms + gloves */}
      <path d="M74 40l24-14 8 10-24 16z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx="104" cy="30" r="12" fill="#fff" stroke={INK} strokeWidth={5} />
      {/* head + helmet */}
      <circle cx="52" cy="30" r="18" fill={SKIN} stroke={INK} strokeWidth={5} />
      <path d="M35 30c0-11 8-20 17-20s17 9 17 20c0 3-1 5-1 5H36s-1-2-1-5z" fill={p.suitDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x="36" y="26" width="33" height="7" rx="3" fill={INK} />
      <circle cx="45" cy="30" r="6" fill={LENS} stroke={INK} strokeWidth={3} />
      {/* ball saved */}
      <SoccerBall className="" x={104} y={54} size={26} />
    </svg>
  );
}

interface BallProps {
  className?: string;
  x?: number;
  y?: number;
  size?: number;
}

/** Classic panelled soccer ball. */
export function SoccerBall({ className, x = 0, y = 0, size = 48 }: BallProps) {
  const s = size / 48;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      <circle cx="24" cy="24" r="22" fill="#fff" stroke={INK} strokeWidth={5} />
      <path
        d="M24 10l9 6-3 11H18l-3-11z"
        fill={INK}
      />
      <path d="M24 10V2M33 16l7-4M30 27l6 9M18 27l-6 9M15 16l-7-4" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M9 30l6-3M39 30l-6-3M24 46v-8" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx="17" cy="18" r="2.5" fill={INK} />
      <circle cx="31" cy="18" r="2.5" fill={INK} />
    </g>
  );
}

/** Standalone soccer ball (its own SVG). */
export function SoccerBallIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Soccer ball"}>
      {title ? <title>{title}</title> : null}
      <SoccerBall x={0} y={0} size={48} />
    </svg>
  );
}
