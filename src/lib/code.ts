/** Join-code generation. Readable, unambiguous (no 0/O/1/I), e.g. "KART-7QX2". */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX = "KART";

/** Crypto-backed uniform [0,1). Injectable for deterministic tests. */
function cryptoRand(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 2 ** 32;
}

export function generateCode(rand: () => number = cryptoRand, len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  }
  return `${PREFIX}-${s}`;
}

/** Normalize user-entered codes (uppercase, trim, tolerate missing prefix). */
export function normalizeCode(input: string): string {
  const t = input.trim().toUpperCase();
  if (!t) return "";
  if (t.includes("-")) return t;
  return `${PREFIX}-${t}`;
}

export function isValidCodeFormat(code: string): boolean {
  return new RegExp(`^${PREFIX}-[${ALPHABET}]{4,}$`).test(code);
}
