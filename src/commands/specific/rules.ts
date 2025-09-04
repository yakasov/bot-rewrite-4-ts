import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { URL_API_RULES } from "../../consts/constants";
import type { APIResponse, Rules } from "../../types/responses/APIResponse.d.ts";

module.exports = {
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

    const output: string = Object.entries(rules)
      .map(([ruleId, ruleValue]) => `**Rule ${ruleId}**: ${ruleValue}.`)
      .join("\n");
    interaction.reply(output);
  },
};
