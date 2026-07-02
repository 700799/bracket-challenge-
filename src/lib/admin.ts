/** Parse the ADMIN_EMAILS env value (comma/whitespace separated) into a set. */
export function parseAdminEmails(csv: string | undefined | null): Set<string> {
  if (!csv) return new Set();
  return new Set(
    csv
      .split(/[,\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Is this email an admin, per the ADMIN_EMAILS allowlist? */
export function isAdminEmail(
  email: string | undefined | null,
  adminEmailsCsv: string | undefined | null,
): boolean {
  if (!email) return false;
  return parseAdminEmails(adminEmailsCsv).has(email.toLowerCase());
}
