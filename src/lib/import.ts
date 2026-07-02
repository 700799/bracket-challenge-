import { isSupportedSize, SUPPORTED_SIZES } from "@/lib/bracket";

/** An imported team: a name and an optional explicit seed. */
export interface ImportedTeam {
  name: string;
  seed?: number;
}

/**
 * Parse a pasted list of team names — newline- or comma-separated. Trims,
 * drops blanks, and de-duplicates case-insensitively (keeping the first).
 */
export function parseTeamList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[\r\n,]+/)) {
    const name = raw.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

export interface ParsedImport {
  teams: ImportedTeam[];
}

/**
 * Parse an imported payload (JSON or CSV) into teams. Supported shapes:
 *   • JSON array of strings:            ["Brazil", "France", ...]
 *   • JSON array of objects:            [{ "name": "Brazil", "seed": 1 }, ...]
 *   • JSON object with a teams array:   { "teams": [ ... ] }
 *   • CSV (first column = name, optional second column = seed)
 * `contentType` is a hint; the parser also sniffs by content.
 */
export function parseImportedPayload(
  text: string,
  contentType?: string,
): ParsedImport {
  const trimmed = text.trim();
  const looksJson =
    (contentType?.includes("json") ?? false) ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("{");

  if (looksJson) {
    let data: unknown;
    try {
      data = JSON.parse(trimmed);
    } catch {
      throw new Error("Source is not valid JSON.");
    }
    const arr = Array.isArray(data)
      ? data
      : Array.isArray((data as { teams?: unknown }).teams)
        ? (data as { teams: unknown[] }).teams
        : null;
    if (!arr) throw new Error("JSON must be an array of teams or { teams: [...] }.");

    const teams: ImportedTeam[] = arr
      .map((item): ImportedTeam | null => {
        if (typeof item === "string") return { name: item.trim() };
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const name = typeof o.name === "string" ? o.name.trim() : "";
          if (!name) return null;
          const seed =
            typeof o.seed === "number" && Number.isFinite(o.seed)
              ? o.seed
              : undefined;
          return { name, seed };
        }
        return null;
      })
      .filter((t): t is ImportedTeam => !!t && t.name.length > 0);

    return { teams: dedupe(teams) };
  }

  // CSV / plain text: first column is the name, optional second is the seed.
  const teams: ImportedTeam[] = [];
  for (const line of trimmed.split(/\r?\n/)) {
    const row = line.trim();
    if (!row) continue;
    const cols = row.split(",").map((c) => c.trim());
    // Skip a header row like "name,seed".
    if (teams.length === 0 && /^name$/i.test(cols[0])) continue;
    const name = cols[0];
    if (!name) continue;
    const seed = cols[1] && /^\d+$/.test(cols[1]) ? Number(cols[1]) : undefined;
    teams.push({ name, seed });
  }
  return { teams: dedupe(teams) };
}

function dedupe(teams: ImportedTeam[]): ImportedTeam[] {
  const seen = new Set<string>();
  const out: ImportedTeam[] = [];
  for (const t of teams) {
    const key = t.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** True for hostnames we refuse to fetch (SSRF guard). */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "metadata.google.internal" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

export function assertFetchableUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid URL.");
  }
  if (url.protocol !== "https:") throw new Error("Only https URLs are allowed.");
  if (isBlockedHost(url.hostname)) throw new Error("That host is not allowed.");
  return url;
}

const MAX_BYTES = 512 * 1024; // 512 KB cap on imported payloads.

/** Fetch and parse teams from an https URL (SSRF-guarded, size-capped). */
export async function fetchTeamsFromUrl(raw: string): Promise<ParsedImport> {
  const url = assertFetchableUrl(raw);
  const res = await fetch(url, {
    headers: { accept: "application/json, text/csv, text/plain" },
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Source responded ${res.status}.`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error("Source file is too large.");
  return parseImportedPayload(text, res.headers.get("content-type") ?? undefined);
}

/** Validate an imported team count is a supported bracket size. */
export function importedSizeError(count: number): string | null {
  if (isSupportedSize(count)) return null;
  return `Need exactly ${SUPPORTED_SIZES.join(", ")} teams — got ${count}.`;
}
