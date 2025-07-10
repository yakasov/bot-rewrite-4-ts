import * as TestModule from "../../src/util/generateRollTable";
import chanceResponsesJSON from "../../resources/chanceResponses.json";
import { ChanceResponse } from "../../src/types/JSON";

const chanceResponses: { [key: string]: ChanceResponse } =
  chanceResponsesJSON as { [key: string]: ChanceResponse };

describe("generateRollTable", () => {
  it("should generate a roll table with normalized chances", () => {
    const rollTable = TestModule.generateRollTable();
    expect(rollTable).toHaveLength(Object.entries(chanceResponses).length);
    expect(
      rollTable.some((entry) => entry.chance < 0 && entry.chance > 1)
    ).toBe(false);
  });

  it("should regenerate a roll table if extra responses added", () => {
    const rollTable = TestModule.generateRollTable({
      newResponse: { string: "Test", chance: 0.1, type: "message" },
      ...chanceResponses,
    });
    expect(rollTable).toHaveLength(Object.entries(chanceResponses).length + 1);
    expect(
      rollTable.some((entry) => entry.chance < 0 && entry.chance > 1)
    ).toBe(false);
  });
});
