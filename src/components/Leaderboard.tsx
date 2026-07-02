import { Medal, Coin, Star } from "@/components/art/icons";
import { HeroMascot, type MascotVariant } from "@/components/art/mascots";
import { PunishmentVideo } from "@/components/PunishmentVideo";
import { punishmentsForUser, type ResolvedPunishment } from "@/lib/punishments";
import type { LeaderboardEntry } from "@/lib/scoring";

export function Leaderboard({
  entries,
  resolved,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  resolved: ResolvedPunishment[];
  currentUserId?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="sticker bg-[#141a4d] p-6 text-center text-cream/60">
        No racers yet — be the first to sign up and make your picks!
      </div>
    );
  }

  return (
    <div className="sticker overflow-hidden bg-[#0e1547]/70">
      <ul className="divide-y-2 divide-ink/40">
        {entries.map((e, i) => {
          const place = i + 1;
          const mine = e.userId === currentUserId;
          const punishments = punishmentsForUser(resolved, e.userId);
          return (
            <li
              key={e.userId}
              className={`flex items-center gap-3 px-3 py-2 ${
                mine ? "bg-star/15" : ""
              }`}
            >
              <div className="w-10 shrink-0">
                {place <= 3 ? (
                  <Medal place={place} className="h-9 w-9" />
                ) : (
                  <span className="titlecard block text-center text-xl text-cream/70">
                    {place}
                  </span>
                )}
              </div>

              <HeroMascot
                variant={e.mascotVariant as MascotVariant}
                className="h-10 w-10 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-cream">
                    {e.username}
                    {mine ? <span className="text-star"> (you)</span> : null}
                  </span>
                  {punishments.map((r) => (
                    <PunishmentVideo
                      key={r.punishment.id}
                      url={r.punishment.youtubeUrl}
                      label={r.punishment.label}
                      slotLabel={r.slotLabel}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-cream/60">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" /> {e.exactCount} exact
                  </span>
                  <span>{e.correctWinners} winners</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Coin className="h-6 w-6" />
                <span className="titlecard text-xl text-star">{e.points}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
