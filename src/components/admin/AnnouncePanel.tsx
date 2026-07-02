"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { postAnnouncement } from "@/app/actions/admin";
import type { AdminAnnouncement } from "./types";

export function AnnouncePanel({
  tournamentId,
  announcements,
}: {
  tournamentId: string;
  announcements: AdminAnnouncement[];
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [body, setBody] = React.useState("");
  const [sendEmail, setSendEmail] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await postAnnouncement({ tournamentId, body, sendEmail });
      if (res.ok) {
        fb.confirm();
        setBody("");
        setMsg(
          sendEmail
            ? res.emailed
              ? `Posted and emailed ${res.emailed} member(s).`
              : "Posted. (Email is not configured, so none were sent.)"
            : "Posted to the tournament page.",
        );
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="sticker bg-[#141a4d] p-5">
        <h2 className="titlecard mb-3 text-xl text-cream">Post an announcement</h2>
        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Round of 16 picks lock Friday at 8pm!"
            className="w-full rounded-xl border-4 border-ink bg-cream px-3 py-2 font-display text-ink"
          />
          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => {
                fb.select();
                setSendEmail(e.target.checked);
              }}
              className="h-4 w-4 accent-[#F5C518]"
            />
            Also email everyone in this tournament
          </label>
          <button type="submit" disabled={pending} className="kart-btn bg-kart text-ink !py-1.5 text-sm">
            {pending ? "Posting…" : "Post announcement"}
          </button>
          {msg ? <p className="text-sm text-star">{msg}</p> : null}
        </form>
      </div>

      <div className="space-y-2">
        <h2 className="titlecard text-xl text-cream">Recent</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-cream/60">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="sticker bg-[#0e1547]/70 p-3">
              <p className="whitespace-pre-wrap text-cream">{a.body}</p>
              <div className="mt-1 text-xs text-cream/50">
                {new Date(a.createdAtMs).toLocaleString()}
                {a.emailedCount > 0 ? ` · emailed ${a.emailedCount}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
