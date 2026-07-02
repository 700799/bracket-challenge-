/**
 * Extract a YouTube video id from the common URL shapes:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 * Returns null if no valid 11-char id is found.
 */
export function parseYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Bare id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const m = url.pathname.match(/^\/(embed|shorts|v)\/([a-zA-Z0-9_-]+)/);
      id = m ? m[2] : null;
    }
  }

  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export function isValidYouTubeUrl(input: string): boolean {
  return parseYouTubeId(input) !== null;
}

export function youTubeEmbedUrl(input: string): string | null {
  const id = parseYouTubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youTubeThumbnail(input: string): string | null {
  const id = parseYouTubeId(input);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Human label for a punishment slot. `fromBottom` counts up from last place
 * (1 = last, 4 = "4th from last"); `absoluteRank` counts from the top.
 */
export function punishmentSlotLabel(
  fromBottom: number | null,
  absoluteRank: number | null,
): string {
  if (fromBottom != null) {
    if (fromBottom === 1) return "Last place";
    return `${ordinal(fromBottom)} from last`;
  }
  if (absoluteRank != null) return `${ordinal(absoluteRank)} place`;
  return "Unassigned";
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
