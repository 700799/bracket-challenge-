"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { createPunishment, deletePunishment } from "@/app/actions/admin";
import { youTubeThumbnail } from "@/lib/youtube";
import { ordinal } from "@/lib/youtube";
import type { AdminPunishment } from "./types";

export function PunishmentsPanel({
  tournamentId,
  punishments,
}: {
  tournamentId: string;
  punishments: AdminPunishment[];
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [mode, setMode] = React.useState<"fromBottom" | "absolute">("fromBottom");
  const [value, setValue] = React.useState(1);
  const [url, setUrl] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await createPunishment({
        tournamentId,
        mode,
        value,
        youtubeUrl: url,
        label: label || undefined,
      });
      if (res.ok) {
        fb.confirm();
        setUrl("");
        setLabel("");
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      await deletePunishment({ id });
      fb.select();
      router.refresh();
    });
  }

  const preview =
    mode === "fromBottom"
      ? value === 1
        ? "Last place"
        : `${ordinal(value)} from last`
      : `${ordinal(value)} place`;

  return (
    <div className="space-y-5">
      <div className="sticker bg-[#0e1547]/70 p-4">
        <h3 className="titlecard mb-3 text-lg text-cream">Assign a workout punishment</h3>
        <form onSubmit={add} className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-cream">
              Spot type
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className="mt-1 block rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
              >
                <option value="fromBottom">From last place</option>
                <option value="absolute">From the top</option>
              </select>
            </label>
            <label className="text-sm text-cream">
              Position
              <input
                type="number"
                min={1}
                max={64}
                value={value}
                onChange={(e) => setValue(Math.max(1, Number(e.target.value)))}
                className="mt-1 block w-20 rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
              />
            </label>
            <span className="chip bg-star text-ink">Targets: {preview}</span>
          </div>

          <label className="block text-sm text-cream">
            YouTube link
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/…"
              className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
            />
          </label>
          <label className="block text-sm text-cream">
            Label (optional)
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 100 burpees"
              className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
            />
          </label>

          <button type="submit" disabled={pending} className="kart-btn bg-racing text-cream !py-1.5 text-sm">
            {pending ? "Saving…" : "Add punishment"}
          </button>
          {msg ? <p className="text-racing">{msg}</p> : null}
        </form>
      </div>

      <div className="space-y-2">
        <h3 className="titlecard text-lg text-cream">Assigned punishments</h3>
        {punishments.length === 0 ? (
          <p className="text-sm text-cream/60">None yet.</p>
        ) : (
          punishments.map((p) => {
            const thumb = youTubeThumbnail(p.youtubeUrl);
            return (
              <div key={p.id} className="sticker flex items-center gap-3 bg-[#141a4d] p-2">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-12 w-20 rounded-md border-2 border-ink object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-cream">
                    {p.slotLabel}
                    {p.label ? <span className="text-cream/70"> · {p.label}</span> : null}
                  </div>
                  <div className="truncate text-xs text-cream/50">{p.youtubeUrl}</div>
                  <div className="text-xs text-star">
                    Currently: {p.targetUsername ?? "no one in this spot yet"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="kart-btn bg-cream text-ink !px-3 !py-1 text-xs"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
