import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { BotContext } from "../../types/BotContext";
import { addToStats } from "../../stats/statsHelpers";

export default {
  data: new SlashCommandBuilder()
    .setName("resetstats")
    .setDescription("Y2K moment"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!interaction.guild) return;

    if (
      interaction.user === interaction.client.application.owner ||
      interaction.user.id === (await interaction.guild.fetchOwner()).user.id
    ) {
      addToStats(
        {
          guildId: interaction.guild.id,
          type: "guildInit",
          userId: "",
        },
        context
      );
    }

    await interaction.reply({
      content: "You are not an admin user!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
