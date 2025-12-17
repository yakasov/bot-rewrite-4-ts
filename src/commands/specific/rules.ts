import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { URL_API_RULES } from "../../consts/constants";
import type {
  APIResponse,
  Rules,
} from "../../types/responses/APIResponse.d.ts";

export default {
  data: new SlashCommandBuilder().setName("rules").setDescription("The rules."),
  async execute(interaction: ChatInputCommandInteraction) {
    const rules: Rules = await fetch(URL_API_RULES, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      method: "GET",
    })
      .then((response: Response) => response.json())
      .then((json: APIResponse) => json.data);

    const rulesString: string = Object.entries(rules)
      .filter(
        ([ruleId, ruleValue]) =>
          /^.*?[0-9]$/.test(ruleId[0]) && ruleValue !== ""
      )
      .map(
        ([ruleId, ruleValue]) =>
          `**Rule ${ruleId}**: ${ruleValue}${
            ruleValue.slice(-1) !== "." ? "." : ""
          }`
      )
      .join("\n");
    const lawsString: string = Object.entries(rules)
      .filter(
        ([lawName, lawValue]) =>
          !/^.*?[0-9]$/.test(lawName[0]) && lawValue !== ""
      )
      .map(
        ([lawName, lawValue]) =>
          `**${lawName}**: ${lawValue}${lawValue.slice(-1) !== "." ? "." : ""}`
      )
      .join("\n");
    const output = `# Rules\n${rulesString}\n\n# Laws\n${lawsString}`;
    interaction.reply(output);
  },
};
