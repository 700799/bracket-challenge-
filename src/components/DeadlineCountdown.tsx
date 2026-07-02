"use client";

import * as React from "react";
import { Lock } from "@/components/art/icons";
import { HeroRunning } from "@/components/art/mascots";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

/** Live countdown to the picks deadline with a locked/open status pill. */
export function DeadlineCountdown({ deadlineMs }: { deadlineMs: number | null }) {
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (deadlineMs == null) {
    return (
      <div className="sticker flex items-center justify-center gap-2 bg-[#141a4d] px-4 py-2 text-sm text-cream/70">
        Picks are open — deadline to be announced
      </div>
    );
  }

  const remaining = deadlineMs - now;
  const locked = remaining <= 0;

  if (locked) {
    return (
      <div className="sticker flex items-center justify-center gap-2 bg-racing px-4 py-2 font-display uppercase text-cream">
        <Lock className="h-6 w-6" /> Picks are locked
      </div>
    );
  }

  const t = parts(remaining);
  const box = (n: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="titlecard text-2xl text-cream sm:text-3xl">
        {String(n).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-cream/60">
        {label}
      </span>
    </div>
  );

  return (
    <div className="sticker flex items-center justify-center gap-3 bg-gradient-to-r from-kart/30 to-[#141a4d] px-4 py-2">
      <HeroRunning variant="green" className="hidden h-12 w-12 animate-hero-run sm:block" />
      <span className="hidden font-display text-xs uppercase text-cream/70 sm:block">
        Picks lock in
      </span>
      <div className="flex items-center gap-2">
        {box(t.d, "days")}
        <span className="titlecard text-2xl text-cream/50">:</span>
        {box(t.h, "hrs")}
        <span className="titlecard text-2xl text-cream/50">:</span>
        {box(t.m, "min")}
        <span className="titlecard text-2xl text-cream/50">:</span>
        {box(t.s, "sec")}
      </div>
    </div>
  );
}
