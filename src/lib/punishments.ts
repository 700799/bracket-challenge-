import type { LeaderboardEntry } from "@/lib/scoring";
import { punishmentSlotLabel } from "@/lib/youtube";

export interface PunishmentLike {
  id: string;
  fromBottom: number | null;
  absoluteRank: number | null;
  youtubeUrl: string;
  label: string | null;
}

export interface ResolvedPunishment {
  punishment: PunishmentLike;
  /** The leaderboard entry currently occupying the targeted spot (or null). */
  entry: LeaderboardEntry | null;
  slotLabel: string;
}

/**
 * Map each punishment to the player currently in its targeted spot.
 * `fromBottom` counts from last place (1 = last), `absoluteRank` from the top.
 * Uses array position in the already-sorted leaderboard.
 */
export function resolvePunishmentTargets(
  entries: LeaderboardEntry[],
  punishments: PunishmentLike[],
): ResolvedPunishment[] {
  return punishments.map((p) => {
    let index: number | null = null;
    if (p.fromBottom != null) index = entries.length - p.fromBottom;
    else if (p.absoluteRank != null) index = p.absoluteRank - 1;

    const entry =
      index != null && index >= 0 && index < entries.length
        ? entries[index]
        : null;

    return {
      punishment: p,
      entry,
      slotLabel: punishmentSlotLabel(p.fromBottom, p.absoluteRank),
    };
  });
}

/** Punishments assigned to a given user (for leaderboard badges). */
export function punishmentsForUser(
  resolved: ResolvedPunishment[],
  userId: string,
): ResolvedPunishment[] {
  return resolved.filter((r) => r.entry?.userId === userId);
}
