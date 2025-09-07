import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import type { BotContext } from "../../types/BotContext.d.ts";
import { addToStats } from "../../stats/statsHelpers";
import type { GuildStats } from "../../types/Stats.d.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("toggleresponses")
    .setDescription("Toggle responses for the current server (owner only)"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!interaction.guild) return;

    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      (interaction.guild &&
        interaction.user.id ===
          (await interaction.guild.fetchOwner())?.user?.id)
    ) {
      addToStats(
        {
          guildId: interaction.guild.id,
          type: "guildInit",
          userId: "",
        },
        context
      );
      const guildStats: GuildStats = context.stats?.[interaction.guild.id] as GuildStats;
      guildStats.guild.allowResponses = !guildStats.guild.allowResponses;

      await interaction.reply(
        `Toggled responses for guild ${interaction.guild?.name} (responses is now ${guildStats.guild.allowResponses}).`
      );
      return;
    }

    await interaction.reply({
      content: "You are not an admin user!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
