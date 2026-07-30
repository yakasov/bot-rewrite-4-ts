import chanceResponsesJSON from "../../resources/chanceResponses.json";
import { ChanceResponse } from "../types/JSON";

const chanceResponses: Record<string, ChanceResponse> =
  chanceResponsesJSON as Record<string, ChanceResponse>;

  /**
   * Creates a normalised 'table' (flat array) of responses based on their chance to be activated.
   * Each element of the array has a cumulative chance.
   * The choice function will generate a number, and find the first match above that number.
   * 
   * @param newResponses - whether this function is being invoked as a result of /editresponses
   * @returns the normalised flat array of ChanceResponses
   */
export function generateRollTable(newResponses?: Record<string, ChanceResponse>): ChanceResponse[] {
  const responses: Record<string, ChanceResponse> = newResponses ?? chanceResponses;

  let cumChance = 0;
  const totalChance: number = Object.values(responses).reduce(
    (sum, response) => sum + response.chance,
    0
  );
  const rollTable: ChanceResponse[] = Object.values(responses).map(
    (response) => {
      const normalizedChance = response.chance * (100 / totalChance);
      const entry = {
        ...response,
        chance: normalizedChance + cumChance,
        type: response.type as "message" | "reaction",
      };
      if (response.targetUserId) entry.targetUserId = response.targetUserId;
      cumChance += normalizedChance;
      return entry;
    }
  );

  return rollTable;
}
