import { describe, it, expect } from "vitest";
import { generateCode, normalizeCode, isValidCodeFormat } from "./code";

describe("join codes", () => {
  it("generates a prefixed code from injectable randomness", () => {
    // rand always 0 → first alphabet char 'A'
    const code = generateCode(() => 0, 4);
    expect(code).toBe("KART-AAAA");
    expect(isValidCodeFormat(code)).toBe(true);
  });

  it("uses the unambiguous alphabet (no 0/O/1/I)", () => {
    const code = generateCode(() => 0.9999, 6);
    expect(code).toMatch(/^KART-[A-Z2-9]{6}$/);
    expect(code).not.toMatch(/[01OI]/);
  });

  it("normalizes user input", () => {
    expect(normalizeCode("  7qx2 ")).toBe("KART-7QX2");
    expect(normalizeCode("kart-7qx2")).toBe("KART-7QX2");
    expect(normalizeCode("")).toBe("");
  });

  it("validates format", () => {
    expect(isValidCodeFormat("KART-7QX2")).toBe(true);
    expect(isValidCodeFormat("NOPE-7QX2")).toBe(false);
    expect(isValidCodeFormat("KART-01")).toBe(false); // ambiguous chars excluded
  });
});
