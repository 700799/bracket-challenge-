"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight haptics + sound engine. Sounds are synthesized with the Web Audio
 * API (no asset files), so "select" feedback is instant. Respects a persisted
 * mute flag and `prefers-reduced-motion` for haptics.
 */

type Sound = "select" | "confirm" | "coin" | "whistle" | "error";

const MUTE_KEY = "kh-muted";
let audioCtx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

if (typeof window !== "undefined") {
  muted = window.localStorage.getItem(MUTE_KEY) === "1";
}

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.16,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

export function playSound(kind: Sound) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  switch (kind) {
    case "select":
      tone(ac, 740, 0, 0.06, "square", 0.12);
      break;
    case "confirm":
      tone(ac, 660, 0, 0.07, "square");
      tone(ac, 990, 0.07, 0.1, "square");
      break;
    case "coin":
      tone(ac, 988, 0, 0.05, "square", 0.14);
      tone(ac, 1319, 0.05, 0.14, "square", 0.14);
      break;
    case "whistle":
      tone(ac, 1600, 0, 0.09, "sine", 0.1);
      tone(ac, 2100, 0.08, 0.12, "sine", 0.1);
      break;
    case "error":
      tone(ac, 200, 0, 0.14, "sawtooth", 0.12);
      break;
  }
}

export function haptic(pattern: number | number[] = 12) {
  if (muted) return;
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduce) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  }
  listeners.forEach((l) => l(next));
}

/** Convenience hook: fire coordinated sound + haptic on interactions. */
export function useFeedback() {
  const select = useCallback(() => {
    playSound("select");
    haptic(10);
  }, []);
  const confirm = useCallback(() => {
    playSound("confirm");
    haptic([12, 30, 12]);
  }, []);
  const coin = useCallback(() => {
    playSound("coin");
    haptic(14);
  }, []);
  const error = useCallback(() => {
    playSound("error");
    haptic([20, 40, 20]);
  }, []);
  return { select, confirm, coin, error };
}

/** Reactive mute state for the sound toggle control. */
export function useMuted(): [boolean, (m: boolean) => void] {
  const [m, setM] = useState(muted);
  useEffect(() => {
    const l = (v: boolean) => setM(v);
    listeners.add(l);
    setM(muted);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [m, setMuted];
}
