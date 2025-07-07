import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { BotContext } from "../../types/BotContext";
import { addToStats } from "../../stats/statsHelpers";
import { GuildStats } from "../../types/Stats";

export default {
  data: new SlashCommandBuilder()
    .setName("toggleresponses")
    .setDescription("Toggle responses for the current server (owner only)"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      (interaction.guild &&
        interaction.user.id ===
          (await interaction.guild.fetchOwner())?.user?.id)
    ) {
      addToStats(
        {
          guildId: interaction.guild?.id!,
          type: "guildInit",
          userId: "",
        },
        context
      );
      const guildStats: GuildStats = context.stats?.[interaction.guild?.id!]!;
      guildStats.guild.allowResponses = !guildStats.guild.allowResponses;

      interaction.reply(
        `Toggled responses for guild ${interaction.guild?.name} (responses is now ${guildStats.guild.allowResponses}).`
      );
      return;
    }

    interaction.reply({
      content: "You are not an admin user!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
