import { describe, it, expect } from "vitest";
import {
  mapTeamsResponse,
  mapFixturesToTeams,
  worldCupSampleTeams,
  WORLD_CUP_2022_R16,
} from "./apisports";
import { importedSizeError } from "./import";

describe("api-sports mappers", () => {
  it("maps a /teams response", () => {
    const json = {
      response: [
        { team: { id: 1, name: "Brazil" } },
        { team: { id: 2, name: "France" } },
        { team: { id: 2, name: "France" } }, // dup
        { team: {} }, // no name
      ],
    };
    expect(mapTeamsResponse(json).map((t) => t.name)).toEqual(["Brazil", "France"]);
  });

  it("maps a /fixtures response to unique teams in fixture order", () => {
    const teams = mapFixturesToTeams(WORLD_CUP_2022_R16);
    expect(teams).toHaveLength(16);
    expect(teams[0].name).toBe("Netherlands");
    expect(teams[1].name).toBe("USA");
  });

  it("handles empty / malformed payloads", () => {
    expect(mapTeamsResponse({})).toEqual([]);
    expect(mapFixturesToTeams({ response: [] })).toEqual([]);
    expect(mapFixturesToTeams(null)).toEqual([]);
  });
});

describe("2022 World Cup sample", () => {
  it("yields exactly 16 unique teams that form a valid bracket", () => {
    const teams = worldCupSampleTeams();
    expect(teams).toHaveLength(16);
    expect(new Set(teams.map((t) => t.name.toLowerCase())).size).toBe(16);
    expect(importedSizeError(teams.length)).toBeNull();
  });

  it("includes the real Round-of-16 nations", () => {
    const names = worldCupSampleTeams().map((t) => t.name);
    for (const n of ["Argentina", "France", "Brazil", "Morocco", "Croatia", "England"]) {
      expect(names).toContain(n);
    }
  });
});
