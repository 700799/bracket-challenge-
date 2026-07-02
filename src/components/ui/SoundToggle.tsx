"use client";

import { useMuted, playSound } from "@/lib/feedback";

/** Mute/unmute toggle for the app's sound + haptics. */
export function SoundToggle() {
  const [muted, setMuted] = useMuted();
  return (
    <button
      type="button"
      aria-pressed={!muted}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Sound off" : "Sound on"}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) playSound("coin");
      }}
      className="pill !px-3"
    >
      <span aria-hidden className="text-base leading-none">
        {muted ? "🔇" : "🔊"}
      </span>
    </button>
  );
}
