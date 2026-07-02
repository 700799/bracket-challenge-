"use client";

import * as React from "react";
import { youTubeEmbedUrl, youTubeThumbnail } from "@/lib/youtube";
import { useFeedback } from "@/lib/feedback";

/** A punishment workout video badge that expands to an embedded player. */
export function PunishmentVideo({
  url,
  label,
  slotLabel,
}: {
  url: string;
  label: string | null;
  slotLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const fb = useFeedback();
  const embed = youTubeEmbedUrl(url);
  const thumb = youTubeThumbnail(url);
  if (!embed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          fb.select();
          setOpen(true);
        }}
        className="chip bg-racing text-cream"
        title={`${slotLabel}: workout punishment`}
      >
        🏋️ {label ?? "Workout"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sticker w-full max-w-2xl bg-[#141a4d] p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="titlecard text-base text-star">
                {slotLabel} · {label ?? "Workout punishment"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  fb.select();
                  setOpen(false);
                }}
                className="kart-btn bg-racing text-cream !px-3 !py-1 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-ink">
              <iframe
                src={embed}
                title="Workout punishment video"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : (
        thumb ? null : null
      )}
    </>
  );
}
