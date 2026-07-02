import * as React from "react";
import {
  INK,
  SKIN,
  HAIR,
  JERSEYS,
  AVATARS,
  AVATAR_BY_ID,
  type Jersey,
  type EyeType,
  type TopType,
  type HandType,
  type EquipType,
  type Element,
} from "./avatar-data";

/**
 * Parametric "Kart Hero" avatar — composes SVG layers (aura, body/jersey, arms +
 * hands, head, face + eyes, headgear, sports equipment) from a preset. All
 * hand-drawn in the bold sticker style; no copyrighted characters.
 */

// Re-export data so callers can `from "@/components/art/avatars"`.
export {
  AVATARS,
  AVATAR_BY_ID,
  AVATAR_IDS,
  DEFAULT_AVATAR,
  type AvatarPreset,
} from "./avatar-data";

function Aura({ element, j }: { element: Element; j: Jersey }) {
  switch (element) {
    case "fire":
      return (
        <g>
          <path d="M50 2c8 12 20 16 20 34 0 16-12 26-20 26S30 52 30 36C30 18 42 14 50 2z" fill="#FF7A1A" stroke={INK} strokeWidth={3} />
          <path d="M50 14c5 8 12 12 12 24 0 10-7 16-12 16s-12-6-12-16c0-12 7-16 12-24z" fill="#F5C518" />
          <path d="M14 96c-6-8-4-18 2-24-2 10 4 14 4 22M86 96c6-8 4-18-2-24 2 10-4 14-4 22" fill="#FF7A1A" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      );
    case "lightning":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M22 8l-12 22h10l-8 20 22-26H22l8-16z" fill="#F5C518" />
          <path d="M84 12l10 20h-9l7 18-19-24h9l-8-14z" fill="#F5C518" />
          <path d="M50 0l-6 14h8l-5 12 14-18h-8l4-8z" fill="#FFE873" />
        </g>
      );
    case "ice":
      return (
        <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
          <path d="M16 20l6 6-6 6-6-6zM84 20l6 6-6 6-6-6zM50 2l7 8-7 8-7-8z" fill="#9FD8FF" />
          <path d="M12 74l5 5-5 5-5-5zM88 74l5 5-5 5-5-5z" fill="#CFE9FF" />
        </g>
      );
    case "star":
      return (
        <g fill="#F5C518" stroke={INK} strokeWidth={2}>
          <path d="M16 16l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" />
          <path d="M84 22l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" />
          <path d="M50 2l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" />
        </g>
      );
    case "wind":
      return (
        <g fill="none" stroke="#BFE3FF" strokeWidth={3.5} strokeLinecap="round">
          <path d="M8 30h22a6 6 0 1 0-6-8" />
          <path d="M10 44h30a6 6 0 1 1-6 8" />
          <path d="M70 26h16a5 5 0 1 1-5 7" />
        </g>
      );
    case "water":
      return (
        <g fill="#3FA0E8" stroke={INK} strokeWidth={2.5}>
          <path d="M16 18c4 5 6 8 6 12a6 6 0 1 1-12 0c0-4 2-7 6-12z" />
          <path d="M84 22c4 5 6 8 6 12a6 6 0 1 1-12 0c0-4 2-7 6-12z" />
        </g>
      );
    case "leaf":
      return (
        <g fill="#2FA84F" stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
          <path d="M10 34C18 20 32 20 34 18c-2 14-10 22-24 24z" />
          <path d="M90 34C82 20 68 20 66 18c2 14 10 22 24 24z" />
        </g>
      );
    case "shadow":
      return <ellipse cx="50" cy="46" rx="46" ry="40" fill={j.d} opacity="0.35" />;
    case "rainbow":
      return (
        <g fill="none" strokeWidth={4} strokeLinecap="round">
          <path d="M8 60A42 42 0 0 1 92 60" stroke="#E5322D" />
          <path d="M14 62A36 36 0 0 1 86 62" stroke="#F5C518" />
          <path d="M20 64A30 30 0 0 1 80 64" stroke="#33C14E" />
        </g>
      );
    default:
      return null;
  }
}

function Body({ j, number }: { j: Jersey; number: number }) {
  return (
    <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
      <path d="M26 118V80c0-9 6-16 15-17h18c9 1 15 8 15 17v38z" fill={j.c} />
      <path d="M43 64h14l-7 10z" fill={j.d} stroke="none" />
      <path d="M43 64l7 10 7-10" fill="none" strokeWidth={2.5} />
      <circle cx="50" cy="96" r="11" fill="#fff" />
      <text x="50" y="101" textAnchor="middle" fontFamily="var(--font-display), sans-serif" fontSize="13" fill={INK}>
        {number}
      </text>
    </g>
  );
}

function Hand({ x, type, skin, j }: { x: number; type: HandType; skin: string; j: Jersey }) {
  const right = x > 50;
  return (
    <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
      <path d={right ? "M70 72l14 14-8 8-16-14z" : "M30 72L16 86l8 8 16-14z"} fill={j.c} />
      {type === "gloves" ? (
        <>
          <circle cx={x} cy={96} r="8" fill="#EDEDED" />
          <path d={`M${x - 5} 96h10`} strokeWidth={2} />
        </>
      ) : type === "thumbs" ? (
        <>
          <circle cx={x} cy={96} r="8" fill={skin} />
          <path d={`M${x} 88v-6`} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : type === "point" ? (
        <>
          <circle cx={x} cy={96} r="8" fill={skin} />
          <path d={right ? `M${x + 6} 96h7` : `M${x - 6} 96h-7`} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <circle cx={x} cy={96} r="8" fill={skin} />
      )}
    </g>
  );
}

function Head({ skin }: { skin: string }) {
  return (
    <g stroke={INK} strokeWidth={3.5}>
      <circle cx="27" cy="44" r="6" fill={skin} />
      <circle cx="73" cy="44" r="6" fill={skin} />
      <ellipse cx="50" cy="42" rx="24" ry="25" fill={skin} />
    </g>
  );
}

function Top({ type, hair, cap }: { type: TopType; hair: string; cap: string }) {
  switch (type) {
    case "cap":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M28 30c4-14 40-14 44 0 0 4-1 6-1 6H29s-1-2-1-6z" fill={cap} />
          <path d="M26 34c-8 1-12 5-12 5 6 2 14 1 18-2z" fill={cap} />
          <circle cx="50" cy="20" r="3" fill={hair} />
        </g>
      );
    case "helmet":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M26 40c0-18 12-30 24-30s24 12 24 30c0 3-1 5-1 5H27s-1-2-1-5z" fill={cap} />
          <rect x="26" y="34" width="48" height="8" rx="3" fill={INK} stroke="none" />
        </g>
      );
    case "headband":
      return <rect x="26" y="26" width="48" height="8" rx="4" fill={cap} stroke={INK} strokeWidth={3} />;
    case "sweatband":
      return <rect x="27" y="24" width="46" height="6" rx="3" fill={cap} stroke={INK} strokeWidth={2.5} />;
    case "beanie":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M27 30c2-16 44-16 46 0z" fill={cap} />
          <rect x="27" y="28" width="46" height="6" rx="3" fill={cap} />
          <circle cx="50" cy="12" r="4" fill={cap} />
        </g>
      );
    case "crown":
      return <path d="M30 26l4-12 8 8 8-10 8 10 8-8 4 12z" fill="#F5C518" stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    case "mohawk":
      return <path d="M44 8l3 14h6l3-14 4 4-2 12H42l-2-12z" fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    case "bandana":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M26 28c6-8 42-8 48 0v6H26z" fill={cap} />
          <path d="M74 30l10 4-4 8-8-6z" fill={cap} />
        </g>
      );
    case "hood":
      return <path d="M18 46C18 22 34 10 50 10s32 12 32 36c-6-6-14-8-14-8H32s-8 2-14 8z" fill={cap} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    case "none":
      return <path d="M32 24c6-6 30-6 36 0-6-2-30-2-36 0z" fill={hair} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />;
    default: // hair
      return <path d="M27 40c-2-22 12-32 23-32s25 10 23 32c-3-8-6-12-6-12-4 4-30 4-34 0 0 0-3 4-6 12z" fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  }
}

function Eyes({ type }: { type: EyeType }) {
  const L = 40, R = 60, Y = 42;
  const dot = (x: number) => (
    <React.Fragment key={x}>
      <circle cx={x} cy={Y} r="5" fill="#fff" stroke={INK} strokeWidth={2} />
      <circle cx={x + 1} cy={Y} r="2.3" fill={INK} />
    </React.Fragment>
  );
  switch (type) {
    case "determined":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinecap="round">
          {dot(L)}{dot(R)}
          <path d="M34 34l8 3M66 34l-8 3" fill="none" />
        </g>
      );
    case "goggles":
      return (
        <g stroke={INK} strokeWidth={3}>
          <rect x="30" y="36" width="40" height="4" fill={INK} stroke="none" />
          <circle cx={L} cy={Y} r="8" fill="#8FD3FF" />
          <circle cx={R} cy={Y} r="8" fill="#8FD3FF" />
          <circle cx={L - 3} cy={Y - 3} r="2" fill="#fff" stroke="none" />
          <circle cx={R - 3} cy={Y - 3} r="2" fill="#fff" stroke="none" />
        </g>
      );
    case "shades":
      return (
        <g stroke={INK} strokeWidth={3}>
          <path d="M30 38h40" />
          <rect x="32" y="38" width="14" height="9" rx="3" fill={INK} />
          <rect x="54" y="38" width="14" height="9" rx="3" fill={INK} />
        </g>
      );
    case "star":
      return (
        <g fill="#F5C518" stroke={INK} strokeWidth={2}>
          <path d={`M${L} 36l1.5 4 4 .5-3 2.6.8 4-3.3-2-3.3 2 .8-4-3-2.6 4-.5z`} />
          <path d={`M${R} 36l1.5 4 4 .5-3 2.6.8 4-3.3-2-3.3 2 .8-4-3-2.6 4-.5z`} />
        </g>
      );
    case "wink":
      return (
        <g stroke={INK} strokeWidth={3} strokeLinecap="round">
          {dot(L)}
          <path d="M55 42q5 4 10 0" fill="none" />
        </g>
      );
    case "wide":
      return (
        <g stroke={INK} strokeWidth={2}>
          <circle cx={L} cy={Y} r="7" fill="#fff" />
          <circle cx={R} cy={Y} r="7" fill="#fff" />
          <circle cx={L + 1} cy={Y} r="3" fill={INK} />
          <circle cx={R + 1} cy={Y} r="3" fill={INK} />
        </g>
      );
    case "fiery":
      return (
        <g stroke={INK} strokeWidth={2}>
          <circle cx={L} cy={Y} r="6" fill="#FF7A1A" />
          <circle cx={R} cy={Y} r="6" fill="#FF7A1A" />
          <circle cx={L} cy={Y} r="2.5" fill={INK} />
          <circle cx={R} cy={Y} r="2.5" fill={INK} />
        </g>
      );
    case "electric":
      return (
        <g stroke={INK} strokeWidth={2}>
          <circle cx={L} cy={Y} r="6" fill="#7FE9FF" />
          <circle cx={R} cy={Y} r="6" fill="#7FE9FF" />
          <circle cx={L} cy={Y} r="2.5" fill={INK} />
          <circle cx={R} cy={Y} r="2.5" fill={INK} />
        </g>
      );
    case "visor":
      return <rect x="28" y="37" width="44" height="9" rx="4" fill="#7FE9FF" stroke={INK} strokeWidth={3} />;
    default:
      return <g>{dot(L)}{dot(R)}</g>;
  }
}

function Mouth() {
  return <path d="M43 54q7 6 14 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />;
}

function Equip({ type }: { type: EquipType }) {
  const cx = 82, cy = 104, r = 13;
  const glyph = () => {
    switch (type) {
      case "ball":
        return (
          <g stroke={INK} strokeWidth={1.6}>
            <circle cx={cx} cy={cy} r="7" fill="#fff" />
            <path d={`M${cx} ${cy - 4}l3 2-1 4h-4l-1-4z`} fill={INK} stroke="none" />
          </g>
        );
      case "whistle":
        return <path d={`M${cx - 7} ${cy - 2}h9a5 5 0 1 1-5 6l-1-2h-3z`} fill="#E5322D" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
      case "trophy":
        return (
          <g stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
            <path d={`M${cx - 5} ${cy - 6}h10l-1 6-4 2-4-2z`} fill="#F5C518" />
            <rect x={cx - 3} y={cy + 2} width="6" height="4" fill="#D19E00" />
          </g>
        );
      case "cone":
        return <path d={`M${cx} ${cy - 6}l6 12h-12z`} fill="#FF7A1A" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
      case "flag":
        return (
          <g stroke={INK} strokeWidth={1.6}>
            <path d={`M${cx - 5} ${cy - 6}v12`} />
            <path d={`M${cx - 5} ${cy - 6}h10v6h-10z`} fill="#fff" />
            <path d={`M${cx - 5} ${cy - 6}h5v3h-5zM${cx} ${cy - 3}h5v3h-5z`} fill={INK} stroke="none" />
          </g>
        );
      case "medal":
        return (
          <g stroke={INK} strokeWidth={1.6}>
            <path d={`M${cx - 4} ${cy - 7}l3 6M${cx + 4} ${cy - 7}l-3 6`} />
            <circle cx={cx} cy={cy + 2} r="5" fill="#F5C518" />
          </g>
        );
      case "bottle":
        return <rect x={cx - 3} y={cy - 6} width="6" height="12" rx="2" fill="#7FE9FF" stroke={INK} strokeWidth={1.6} />;
      case "star":
        return <path d={`M${cx} ${cy - 7}l2 4 4.5.5-3.3 3 .8 4.5-4-2.2-4 2.2.8-4.5-3.3-3 4.5-.5z`} fill="#F5C518" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />;
      case "boot":
        return <path d={`M${cx - 6} ${cy - 3}h6l2 4h4v4h-12z`} fill="#111318" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
      case "gk":
        return (
          <g stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
            <path d={`M${cx - 5} ${cy + 6}v-8a2 2 0 0 1 4 0v-2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v8z`} fill="#EDEDED" />
          </g>
        );
      case "cards":
        return (
          <g stroke={INK} strokeWidth={1.4}>
            <rect x={cx - 6} y={cy - 6} width="7" height="11" rx="1.5" fill="#F5C518" transform={`rotate(-12 ${cx} ${cy})`} />
            <rect x={cx} y={cy - 6} width="7" height="11" rx="1.5" fill="#E5322D" transform={`rotate(10 ${cx} ${cy})`} />
          </g>
        );
      case "band":
        return (
          <g stroke={INK} strokeWidth={1.6}>
            <rect x={cx - 6} y={cy - 3} width="12" height="6" rx="2" fill="#E5322D" />
            <text x={cx} y={cy + 2} textAnchor="middle" fontSize="5" fill="#fff" fontFamily="var(--font-display), sans-serif">C</text>
          </g>
        );
    }
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0e1547" stroke={INK} strokeWidth={3} />
      {glyph()}
    </g>
  );
}

export function HeroAvatar({
  avatarId,
  className,
  title,
}: {
  avatarId: string;
  className?: string;
  title?: string;
}) {
  const p = AVATAR_BY_ID.get(avatarId) ?? AVATARS[0];
  const j = JERSEYS[p.jersey];
  const skin = SKIN[p.skin];
  const hair = HAIR[p.hair];
  const cap = j.c;

  return (
    <svg viewBox="0 0 100 122" className={className} role="img" aria-label={title ?? p.name}>
      <title>{title ?? p.name}</title>
      <Aura element={p.element} j={j} />
      <Body j={j} number={(AVATARS.indexOf(p) % 25) + 1} />
      <Hand x={18} type={p.hands} skin={skin} j={j} />
      <Hand x={82} type={p.hands === "ball" ? "fists" : p.hands} skin={skin} j={j} />
      {p.hands === "ball" ? (
        <g stroke={INK} strokeWidth={2}>
          <circle cx="82" cy="92" r="9" fill="#fff" />
          <path d="M82 86l4 3-1.5 5h-5L78 89z" fill={INK} stroke="none" />
        </g>
      ) : null}
      <Head skin={skin} />
      <Top type={p.top} hair={hair} cap={cap} />
      <Eyes type={p.eyes} />
      <Mouth />
      <Equip type={p.equip} />
    </svg>
  );
}
