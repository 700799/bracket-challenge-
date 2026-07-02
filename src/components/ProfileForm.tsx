"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { HeroAvatar, AVATARS, DEFAULT_AVATAR } from "@/components/art/avatars";
import { saveProfile } from "@/app/actions/profile";

export function ProfileForm({
  initialUsername,
  initialAvatar,
}: {
  initialUsername: string;
  initialAvatar: string;
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [username, setUsername] = React.useState(initialUsername);
  const [avatar, setAvatar] = React.useState(initialAvatar || DEFAULT_AVATAR);
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const groups = ["Sport", "Elemental"] as const;
  const selected = AVATARS.find((a) => a.id === avatar);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await saveProfile({ username, mascotVariant: avatar });
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
        <div className="mb-2 flex items-center gap-3">
          <label className="font-display text-sm text-cream">
            Choose your hero <span className="text-cream/50">(50 to pick from)</span>
          </label>
          {selected ? (
            <span className="chip bg-star text-ink">{selected.name}</span>
          ) : null}
        </div>

        <div className="max-h-96 space-y-4 overflow-y-auto rounded-xl border-4 border-ink bg-[#0e1547]/60 p-3">
          {groups.map((g) => (
            <div key={g}>
              <h4 className="titlecard mb-2 text-sm text-cream/80">
                {g === "Sport" ? "⚽ Sport Heroes" : "🔥 Elemental Characters"}
              </h4>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {AVATARS.filter((a) => a.group === g).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={avatar === a.id}
                    aria-label={a.name}
                    title={a.name}
                    onClick={() => {
                      fb.select();
                      setAvatar(a.id);
                    }}
                    className={`sticker bg-[#141a4d] p-1 transition-transform hover:-translate-y-0.5 ${
                      avatar === a.id ? "ring-4 ring-star" : ""
                    }`}
                  >
                    <HeroAvatar avatarId={a.id} className="h-full w-full" />
                  </button>
                ))}
              </div>
            </div>
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
