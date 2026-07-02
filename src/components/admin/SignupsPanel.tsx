"use client";

import { HeroAvatar } from "@/components/art/avatars";
import type { AdminSignup } from "./types";

export function SignupsPanel({ signups }: { signups: AdminSignup[] }) {
  if (signups.length === 0) {
    return (
      <div className="sticker bg-[#141a4d] p-6 text-center text-cream/60">
        No signups yet.
      </div>
    );
  }
  return (
    <div className="sticker overflow-x-auto bg-[#0e1547]/70 p-2">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="font-display text-cream/70">
            <th className="px-2 py-2">Hero</th>
            <th className="px-2 py-2">Username</th>
            <th className="px-2 py-2">Real name</th>
            <th className="px-2 py-2">Email</th>
            <th className="px-2 py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((s) => (
            <tr key={s.userId} className="border-t-2 border-ink/40 text-cream">
              <td className="px-2 py-1.5">
                <HeroAvatar avatarId={s.mascotVariant} className="h-9 w-9" />
              </td>
              <td className="px-2 py-1.5 font-display">{s.username}</td>
              <td className="px-2 py-1.5 text-cream/80">{s.name ?? "—"}</td>
              <td className="px-2 py-1.5 text-cream/60">{s.email ?? "—"}</td>
              <td className="px-2 py-1.5 text-cream/60">
                {new Date(s.joinedAtMs).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-2 py-2 text-xs text-cream/50">
        {signups.length} racer{signups.length === 1 ? "" : "s"} · real names &
        emails are visible to admins only.
      </p>
    </div>
  );
}
