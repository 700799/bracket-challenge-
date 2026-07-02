import { Coin, Star } from "@/components/art/icons";
import { roundLabel } from "@/lib/scoring";
import type { TournamentStats } from "@/lib/stats";

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="sticker bg-[#141a4d] p-3 text-center">
      <div className="titlecard text-2xl text-star">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-cream/60">{label}</div>
    </div>
  );
}

export function StatsPanel({
  stats,
  teamName,
}: {
  stats: TournamentStats;
  teamName: (id: string) => string;
}) {
  if (stats.memberCount === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Players" value={stats.memberCount} />
        <Tile label="Average pts" value={stats.averagePoints} />
        <Tile label="Median pts" value={stats.medianPoints} />
        <Tile label="Top pts" value={stats.topPoints} />
      </div>

      {stats.viewer ? (
        <div className="sticker bg-gradient-to-r from-star/25 to-[#141a4d] p-3 text-center font-display text-cream">
          Your rank in group: <b className="text-star">#{stats.viewer.rank}</b> ·{" "}
          {stats.viewer.points} pts · top {100 - stats.viewer.percentile}%
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Biggest delta scores */}
        <div className="sticker bg-[#0e1547]/70 p-3">
          <h3 className="titlecard mb-2 text-lg text-cream">Biggest delta scores</h3>
          {stats.biggestDeltas.length === 0 ? (
            <p className="text-sm text-cream/50">No scored picks yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {stats.biggestDeltas.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-cream">
                    <b>{d.username}</b>{" "}
                    <span className="text-cream/60">
                      {teamName(d.homeTeamId)} {d.homeScore}–{d.awayScore}{" "}
                      {teamName(d.awayTeamId)} · {roundLabel(d.round)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-star">
                    <Coin className="h-4 w-4" /> {d.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Win / loss records */}
        <div className="sticker bg-[#0e1547]/70 p-3">
          <h3 className="titlecard mb-2 text-lg text-cream">Win / loss records</h3>
          {stats.records.length === 0 ? (
            <p className="text-sm text-cream/50">No results yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="font-display text-cream/60">
                <tr>
                  <th className="py-1">Player</th>
                  <th className="py-1 text-center">W</th>
                  <th className="py-1 text-center">L</th>
                  <th className="py-1 text-center">
                    <Star className="inline h-3.5 w-3.5" />
                  </th>
                  <th className="py-1 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {stats.records.map((r) => (
                  <tr key={r.userId} className="border-t border-ink/40 text-cream">
                    <td className="py-1 font-display">{r.username}</td>
                    <td className="py-1 text-center text-kart">{r.correctWinners}</td>
                    <td className="py-1 text-center text-racing">{r.wrongWinners}</td>
                    <td className="py-1 text-center">{r.exact}</td>
                    <td className="py-1 text-right text-star">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
