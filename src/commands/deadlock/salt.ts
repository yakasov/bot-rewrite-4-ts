import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MatchSaltsResponse } from "../../../deadlock-ts";
import { DAPIMatches } from "../../steam/deadlockApis";

export default {
  data: new SlashCommandBuilder()
    .setName("dsalt")
    .setDescription("Get technical salt of a given match ID")
    .addNumberOption((opt) =>
      opt
        .setName("id")
        .setDescription("The match ID to query")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const matchId = interaction.options.getNumber("id") ?? 0;

    const saltData: MatchSaltsResponse = await DAPIMatches()
      .salts({ matchId })
      .then((a) => a.data);

    await interaction.reply(JSON.stringify(saltData, null, 4));
  },
};
