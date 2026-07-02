import { describe, it, expect } from "vitest";
import {
  parseTeamList,
  parseImportedPayload,
  importedSizeError,
  assertFetchableUrl,
} from "./import";

describe("parseTeamList", () => {
  it("splits on newlines and commas, trims, dedupes", () => {
    const names = parseTeamList("Brazil\nFrance, Spain\n brazil \n\nSpain");
    expect(names).toEqual(["Brazil", "France", "Spain"]);
  });
});

describe("parseImportedPayload", () => {
  it("parses a JSON array of strings", () => {
    const { teams } = parseImportedPayload('["Brazil","France","Spain"]');
    expect(teams.map((t) => t.name)).toEqual(["Brazil", "France", "Spain"]);
  });

  it("parses JSON objects with seeds", () => {
    const { teams } = parseImportedPayload(
      '[{"name":"Brazil","seed":1},{"name":"France","seed":2}]',
    );
    expect(teams[0]).toEqual({ name: "Brazil", seed: 1 });
    expect(teams[1]).toEqual({ name: "France", seed: 2 });
  });

  it("parses { teams: [...] }", () => {
    const { teams } = parseImportedPayload('{"teams":["A","B"]}', "application/json");
    expect(teams.map((t) => t.name)).toEqual(["A", "B"]);
  });

  it("parses CSV with header and seed column", () => {
    const { teams } = parseImportedPayload("name,seed\nBrazil,1\nFrance,2");
    expect(teams).toEqual([
      { name: "Brazil", seed: 1 },
      { name: "France", seed: 2 },
    ]);
  });

  it("dedupes case-insensitively", () => {
    const { teams } = parseImportedPayload('["A","a","B"]');
    expect(teams.map((t) => t.name)).toEqual(["A", "B"]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseImportedPayload("{not json", "application/json")).toThrow();
  });
});

describe("importedSizeError", () => {
  it("accepts supported sizes only", () => {
    expect(importedSizeError(16)).toBeNull();
    expect(importedSizeError(32)).toBeNull();
    expect(importedSizeError(10)).toMatch(/8, 16, 32, 64/);
  });
});

describe("assertFetchableUrl", () => {
  it("allows https public hosts", () => {
    expect(assertFetchableUrl("https://example.com/teams.json").hostname).toBe("example.com");
  });
  it("blocks http, localhost, and private ranges", () => {
    expect(() => assertFetchableUrl("http://example.com")).toThrow();
    expect(() => assertFetchableUrl("https://localhost/x")).toThrow();
    expect(() => assertFetchableUrl("https://127.0.0.1/x")).toThrow();
    expect(() => assertFetchableUrl("https://192.168.1.5/x")).toThrow();
    expect(() => assertFetchableUrl("https://169.254.169.254/x")).toThrow();
    expect(() => assertFetchableUrl("not a url")).toThrow();
  });
});
