"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { HeroMascot, MASCOT_VARIANTS, type MascotVariant } from "@/components/art/mascots";
import { saveProfile } from "@/app/actions/profile";

export function ProfileForm({
  initialUsername,
  initialMascot,
}: {
  initialUsername: string;
  initialMascot: MascotVariant;
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [username, setUsername] = React.useState(initialUsername);
  const [mascot, setMascot] = React.useState<MascotVariant>(initialMascot);
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await saveProfile({ username, mascotVariant: mascot });
      if (res.ok) {
        fb.coin();
        setOk(true);
        setMsg("Saved! Your hero is ready.");
        router.refresh();
      } else {
        fb.error();
        setOk(false);
        setMsg(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1 block font-display text-sm text-cream">
          Username <span className="text-star">(required)</span>
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Speedy_99"
          maxLength={20}
          className="w-full rounded-xl border-4 border-ink bg-cream px-3 py-2 font-display text-ink outline-none focus:ring-4 focus:ring-star"
        />
        <p className="mt-1 text-xs text-cream/60">
          3–20 letters, numbers, or underscores. This is your public name on the
          leaderboard.
        </p>
      </div>

      <div>
        <label className="mb-2 block font-display text-sm text-cream">
          Choose your hero
        </label>
        <div className="flex flex-wrap gap-2">
          {MASCOT_VARIANTS.map((v) => (
            <button
              key={v}
              type="button"
              data-active={mascot === v}
              onClick={() => {
                fb.select();
                setMascot(v);
              }}
              className={`sticker bg-[#141a4d] p-1 transition-transform ${
                mascot === v ? "ring-4 ring-star" : ""
              }`}
              aria-label={`Hero ${v}`}
              aria-pressed={mascot === v}
            >
              <HeroMascot variant={v} className="h-16 w-16" />
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="kart-btn bg-kart text-ink w-full"
      >
        {pending ? "Saving…" : "Save my hero"}
      </button>

      {msg ? (
        <p className={`text-center font-display ${ok ? "text-kart" : "text-racing"}`}>
          {msg}
        </p>
      ) : null}
    </form>
  );
}
