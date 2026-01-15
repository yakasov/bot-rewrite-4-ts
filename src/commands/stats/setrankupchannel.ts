import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotContext } from "../../types/BotContext";

export default {
  data: new SlashCommandBuilder()
    .setName("setrankupchannel")
    .setDescription("Set rank up channel"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!context.stats || !interaction.guild) return;

    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      interaction.user.id === (await interaction.guild.fetchOwner()).user.id
    ) {
      context.stats[interaction.guild.id].guild.rankUpChannel =
        interaction.channel?.id ?? "";
      interaction.reply("Set rank up channel!");
    }
  },
};
