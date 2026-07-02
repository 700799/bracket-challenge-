import { describe, it, expect } from "vitest";
import { parseAdminEmails, isAdminEmail } from "./admin";

describe("admin allowlist", () => {
  it("parses comma and whitespace separated emails, lowercased", () => {
    const set = parseAdminEmails("A@x.com, b@y.com\n c@z.com");
    expect(set.has("a@x.com")).toBe(true);
    expect(set.has("b@y.com")).toBe(true);
    expect(set.has("c@z.com")).toBe(true);
    expect(set.size).toBe(3);
  });

  it("handles empty / null", () => {
    expect(parseAdminEmails("").size).toBe(0);
    expect(parseAdminEmails(null).size).toBe(0);
    expect(parseAdminEmails(undefined).size).toBe(0);
  });

  it("matches case-insensitively", () => {
    expect(isAdminEmail("Boss@Example.com", "boss@example.com")).toBe(true);
    expect(isAdminEmail("nope@example.com", "boss@example.com")).toBe(false);
    expect(isAdminEmail(null, "boss@example.com")).toBe(false);
    expect(isAdminEmail("boss@example.com", "")).toBe(false);
  });
});
