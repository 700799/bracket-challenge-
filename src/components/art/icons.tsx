import * as React from "react";

/** Bold sticker-style icons for the Kart Hero UI. All original artwork. */

const INK = "#0A0A12";

interface IconProps {
  className?: string;
  title?: string;
}

/** World-Cup-style trophy with a globe and laurels. */
export function Trophy({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label={title ?? "Trophy"}>
      {title ? <title>{title}</title> : null}
      {/* laurels */}
      <path d="M34 20c-14 2-22 14-20 34 8-2 14-8 16-16" fill="#2C8C3C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M62 20c14 2 22 14 20 34-8-2-14-8-16-16" fill="#2C8C3C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* globe */}
      <circle cx="48" cy="30" r="19" fill="#F5C518" stroke={INK} strokeWidth={4} />
      <path d="M40 22c6 3 12 3 17 1M38 33c8 3 16 2 21-2M48 11v38" fill="none" stroke={INK} strokeWidth={2.5} />
      {/* neck + checker band */}
      <rect x="42" y="48" width="12" height="10" fill="#F5C518" stroke={INK} strokeWidth={4} />
      {/* stem */}
      <path d="M40 58h16l-3 16H43z" fill="#F5C518" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* base */}
      <rect x="34" y="74" width="28" height="9" rx="2" fill="#D19E00" stroke={INK} strokeWidth={4} />
      <rect x="30" y="83" width="36" height="7" rx="2" fill="#D19E00" stroke={INK} strokeWidth={4} />
      {/* shine */}
      <circle cx="41" cy="24" r="3" fill="#fff" opacity="0.85" />
    </svg>
  );
}

/** Coin with an "M"-less star emblem (original). */
export function Coin({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Coin"}>
      {title ? <title>{title}</title> : null}
      <ellipse cx="24" cy="24" rx="20" ry="21" fill="#F5C518" stroke={INK} strokeWidth={4} />
      <ellipse cx="24" cy="24" rx="13" ry="14" fill="none" stroke={INK} strokeWidth={3} />
      <path d="M24 14l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#D19E00" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <ellipse cx="18" cy="16" rx="3" ry="4" fill="#fff" opacity="0.8" />
    </svg>
  );
}

export function Star({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Star"}>
      {title ? <title>{title}</title> : null}
      <path d="M24 3l6 13 14 1.5-10.5 9.5 3 14L24 47l-12.5 8L14 40 3.5 30.5 17 29z" fill="#F5C518" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx="18" cy="18" r="3" fill="#fff" opacity="0.85" />
    </svg>
  );
}

/** Green check badge for correct picks. */
export function CheckBadge({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Correct"}>
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="20" fill="#33C14E" stroke={INK} strokeWidth={4} />
      <circle cx="24" cy="24" r="14" fill="none" stroke={INK} strokeWidth={2.5} opacity="0.5" />
      <path d="M15 25l6 6 12-14" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Red cross badge for missed picks. */
export function CrossBadge({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Missed"}>
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="20" fill="#E5322D" stroke={INK} strokeWidth={4} />
      <path d="M17 17l14 14M31 17L17 31" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

/** Waving checkered flag. */
export function CheckeredFlag({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title ?? "Checkered flag"}>
      {title ? <title>{title}</title> : null}
      <rect x="10" y="6" width="5" height="52" rx="2" fill={INK} />
      <path d="M15 10c12-6 24 6 36 0v26c-12 6-24-6-36 0z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g fill={INK}>
        <rect x="15" y="10" width="9" height="7" />
        <rect x="33" y="10" width="9" height="7" />
        <rect x="24" y="17" width="9" height="7" />
        <rect x="42" y="15" width="9" height="7" />
        <rect x="15" y="24" width="9" height="7" />
        <rect x="33" y="24" width="9" height="7" />
        <rect x="24" y="31" width="9" height="6" />
      </g>
    </svg>
  );
}

/** Penalty-shootout marker: ball on the spot. */
export function PenaltyIcon({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Penalty"}>
      {title ? <title>{title}</title> : null}
      <ellipse cx="24" cy="38" rx="16" ry="5" fill={INK} opacity="0.25" />
      <circle cx="24" cy="20" r="13" fill="#fff" stroke={INK} strokeWidth={4} />
      <path d="M24 11l5 4-2 6h-6l-2-6z" fill={INK} />
      <path d="M24 11V6M29 15l4-2M27 21l4 5M21 21l-4 5M19 15l-4-2" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="24" cy="38" r="2.5" fill="#fff" stroke={INK} strokeWidth={2} />
    </svg>
  );
}

export function Whistle({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Whistle"}>
      {title ? <title>{title}</title> : null}
      <path d="M6 20h22a10 10 0 1 1-10 12l-2-4H6z" fill="#E5322D" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx="30" cy="30" r="5" fill="#fff" stroke={INK} strokeWidth={3} />
      <rect x="6" y="14" width="14" height="6" rx="3" fill="#B31F1B" stroke={INK} strokeWidth={3} />
    </svg>
  );
}

export function Lock({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? "Locked"}>
      {title ? <title>{title}</title> : null}
      <path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <rect x="10" y="22" width="28" height="20" rx="5" fill="#F5C518" stroke={INK} strokeWidth={4} />
      <circle cx="24" cy="31" r="3.5" fill={INK} />
      <rect x="22.5" y="31" width="3" height="7" rx="1.5" fill={INK} />
    </svg>
  );
}

/** Small circular rank medal (gold/silver/bronze or generic). */
export function Medal({
  place,
  className,
  title,
}: IconProps & { place: number }) {
  const fill =
    place === 1 ? "#F5C518" : place === 2 ? "#CBD5E1" : place === 3 ? "#CD7F32" : "#3A4270";
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? `Rank ${place}`}>
      {title ? <title>{title}</title> : null}
      <path d="M14 4h8l-4 18h-8z" fill="#E5322D" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M26 4h8l4 18h-8z" fill="#1B4DE4" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx="24" cy="31" r="14" fill={fill} stroke={INK} strokeWidth={4} />
      <text x="24" y="37" textAnchor="middle" fontFamily="var(--font-display), sans-serif" fontSize="16" fill={INK}>
        {place}
      </text>
    </svg>
  );
}
