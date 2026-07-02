"use client";

import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";

export interface SwitcherOption {
  id: string;
  name: string;
  bracketSize: number;
}

/** Public dropdown to switch between visible tournaments (via ?t=). */
export function TournamentSwitcher({
  options,
  currentId,
}: {
  options: SwitcherOption[];
  currentId: string;
}) {
  const router = useRouter();
  const fb = useFeedback();
  if (options.length <= 1) return null;

  return (
    <label className="flex items-center gap-2 font-display text-sm text-cream">
      <span className="text-cream/70">Tournament</span>
      <select
        value={currentId}
        onChange={(e) => {
          fb.select();
          router.push(`/?t=${e.target.value}`);
        }}
        className="rounded-full border-4 border-ink bg-cream px-3 py-1.5 font-display text-ink"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.bracketSize})
          </option>
        ))}
      </select>
    </label>
  );
}
