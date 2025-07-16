import { RollTableEntry } from "../types/RollTableEntry";
import chanceResponsesJSON from "../../resources/chanceResponses.json";
import { ChanceResponse } from "../types/JSON";

const chanceResponses: { [key: string]: ChanceResponse } =
  chanceResponsesJSON as { [key: string]: ChanceResponse };

export function generateRollTable(newResponses?: {
  [key: string]: ChanceResponse;
}): RollTableEntry[] {
  const responses: {
    [key: string]: ChanceResponse;
  } = newResponses ?? chanceResponses;

  let cumChance: number = 0;
  const totalChance: number = Object.values(responses).reduce(
    (sum, response) => sum + response.chance,
    0
  );
  const rollTable: RollTableEntry[] = Object.values(responses).map(
    (response) => {
      const normalizedChance = response.chance * (100 / totalChance);
      const entry = {
        ...response,
        chance: normalizedChance + cumChance,
        type: response.type as "message" | "reaction",
      };
      cumChance += normalizedChance;
      return entry;
    }
  );

  return rollTable;
}
