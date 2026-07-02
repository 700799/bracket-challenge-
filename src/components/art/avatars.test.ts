import { describe, it, expect } from "vitest";
import { AVATARS, AVATAR_IDS, AVATAR_BY_ID, DEFAULT_AVATAR } from "./avatar-data";

describe("avatar catalogue", () => {
  it("has exactly 50 avatars", () => {
    expect(AVATARS).toHaveLength(50);
  });

  it("has unique ids and names", () => {
    expect(new Set(AVATAR_IDS).size).toBe(50);
    expect(new Set(AVATARS.map((a) => a.name)).size).toBe(50);
  });

  it("splits into 25 Sport + 25 Elemental", () => {
    expect(AVATARS.filter((a) => a.group === "Sport")).toHaveLength(25);
    expect(AVATARS.filter((a) => a.group === "Elemental")).toHaveLength(25);
  });

  it("includes fire and lightning characters", () => {
    expect(AVATARS.some((a) => a.element === "fire")).toBe(true);
    expect(AVATARS.some((a) => a.element === "lightning")).toBe(true);
    expect(AVATARS.filter((a) => a.element === "fire").length).toBeGreaterThanOrEqual(5);
    expect(AVATARS.filter((a) => a.element === "lightning").length).toBeGreaterThanOrEqual(5);
  });

  it("every preset references a valid jersey and has all feature layers", () => {
    for (const a of AVATARS) {
      expect(a.jersey).toBeGreaterThanOrEqual(0);
      expect(a.jersey).toBeLessThan(12);
      expect(a.skin).toBeTruthy();
      expect(a.eyes).toBeTruthy();
      expect(a.hands).toBeTruthy();
      expect(a.equip).toBeTruthy();
      expect(a.top).toBeTruthy();
    }
  });

  it("default avatar resolves", () => {
    expect(AVATAR_BY_ID.get(DEFAULT_AVATAR)).toBeTruthy();
  });

  it("each avatar is a distinct trait combination", () => {
    const combos = AVATARS.map(
      (a) => `${a.skin}|${a.hair}|${a.jersey}|${a.eyes}|${a.top}|${a.hands}|${a.equip}|${a.element}`,
    );
    expect(new Set(combos).size).toBe(50);
  });
});
