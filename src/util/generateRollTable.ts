import responsesJSON from "../../resources/responses.json"
import { RollTableEntry } from "../types/RollTableEntry";

const responses = Object.values(responsesJSON);

export function generateRollTable(): RollTableEntry[] {
  let cumChance: number = 0;
  const totalChance: number = responses.reduce((sum, r) => sum + r.chance, 0);
  const rollTable: RollTableEntry[] = responses.map((response) => {
    const normalizedChance = response.chance * (100 / totalChance);
    const entry = {
      ...response,
      chance: normalizedChance + cumChance,
      type: response.type as "message" | "reaction"
    };
    cumChance += normalizedChance;
    return entry;
  });

  return rollTable;
}