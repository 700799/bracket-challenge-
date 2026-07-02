"use client";

import * as React from "react";
import Link from "next/link";
import { useFeedback } from "@/lib/feedback";

type KartColor = "red" | "blue" | "green" | "gold" | "purple" | "cream";

const COLOR_BG: Record<KartColor, string> = {
  red: "bg-racing text-cream",
  blue: "bg-cobalt text-cream",
  green: "bg-kart text-ink",
  gold: "bg-star text-ink",
  purple: "bg-power text-cream",
  cream: "bg-cream text-ink",
};

interface KartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: KartColor;
  sound?: "select" | "confirm" | "coin";
}

/** Chunky sticker button with haptics + sound on press. */
export function KartButton({
  color = "gold",
  sound = "confirm",
  className = "",
  onClick,
  children,
  ...rest
}: KartButtonProps) {
  const fb = useFeedback();
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (sound === "coin") fb.coin();
        else if (sound === "select") fb.select();
        else fb.confirm();
        onClick?.(e);
      }}
      className={`kart-btn ${COLOR_BG[color]} ${className}`}
    >
      {children}
    </button>
  );
}

interface KartLinkProps {
  href: string;
  color?: KartColor;
  className?: string;
  children: React.ReactNode;
}

/** Link styled as a Kart button. */
export function KartLink({ href, color = "gold", className = "", children }: KartLinkProps) {
  const fb = useFeedback();
  return (
    <Link href={href} onClick={() => fb.select()} className={`kart-btn ${COLOR_BG[color]} ${className}`}>
      {children}
    </Link>
  );
}

export interface PillOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface PillGroupProps<T extends string> {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Pill-button toggle row (used by the admin section switcher). */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: PillGroupProps<T>) {
  const fb = useFeedback();
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          data-active={value === o.value}
          onClick={() => {
            fb.select();
            onChange(o.value);
          }}
          className="pill"
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  disabled?: boolean;
}

/** Score stepper with +/- sticker buttons and feedback. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
  disabled = false,
}: StepperProps) {
  const fb = useFeedback();
  const set = (v: number) => {
    const clamped = Math.max(min, Math.min(max, v));
    if (clamped !== value) {
      fb.select();
      onChange(clamped);
    }
  };
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => set(value - 1)}
        className="kart-btn bg-cream !px-0 h-9 w-9 text-lg"
        aria-label={`Decrease ${label}`}
      >
        –
      </button>
      <span className="titlecard w-9 text-center text-2xl text-cream" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => set(value + 1)}
        className="kart-btn bg-cream !px-0 h-9 w-9 text-lg"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
