import type { Announcement } from "@/db/schema";

/** Announcement feed shown at the bottom of the tournament page. */
export function Announcements({ items }: { items: Announcement[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="titlecard mb-3 text-2xl text-cream">📣 Announcements</h2>
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="sticker bg-[#141a4d] p-3">
            <p className="whitespace-pre-wrap font-display text-cream">{a.body}</p>
            <div className="mt-1 text-xs text-cream/50">
              {new Date(a.createdAt).toLocaleString()}
              {a.emailedCount > 0 ? ` · emailed ${a.emailedCount}` : ""}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
