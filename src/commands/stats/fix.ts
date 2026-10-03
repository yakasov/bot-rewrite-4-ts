import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotContext } from "../../types/BotContext";
import { UserStats } from "../../types/Stats";
import { updateStatsOnLevelUp } from "../../stats/experienceHelpers";

export default {
  data: new SlashCommandBuilder()
    .setName("fix")
    .setDescription("Recalculate all levels for stats"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!context.stats || !interaction.guild) return;

    const userStats: Record<string, UserStats> =
      context.stats[interaction.guild.id].users;

    for (const key of Object.keys(userStats)) {
      userStats[key].level = 1;
      updateStatsOnLevelUp(userStats[key], context.config);
    }
  },
};
