import {
  SlashCommandBuilder,
  MessageFlags,
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandUserOption,
  SlashCommandBooleanOption,
} from "discord.js";
import { REGEX_DISCORD_MESSAGE_LENGTH_SHORT } from "../../consts/constants";
import {
  formatTime,
  getNicknameFromInteraction,
  orderStatsByRank,
} from "../../stats/statsHelpers";
import { wrapCodeBlockString } from "../../util/commonFunctions";
import type { BotContext } from "../../types/BotContext.d.ts";
import type { GuildStats, UserStats } from "../../types/Stats.d.ts";
import {
  getRequiredExperience,
  getLevelName,
} from "../../stats/experienceHelpers";

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Shows personal statistics")
    .addUserOption((opt: SlashCommandUserOption) =>
      opt.setName("user").setDescription("The user to get the profile of")
    )
    .addBooleanOption((opt: SlashCommandBooleanOption) =>
      opt.setName("debug").setDescription("Whether to print the raw statistics")
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!interaction.guild) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const user: string | null = interaction.options.getUser("user")?.id ?? null;
    const debug = interaction.options.getBoolean("debug") ?? false;

    const guildStats: GuildStats | undefined =
      context.stats?.[interaction.guild.id];
    if (!guildStats) {
      await interaction.reply("This server has no statistics yet!");
      return;
    }

    const userId: string = user ?? interaction.user.id;
    if (!guildStats.users[userId]) {
      await interaction.reply("This user has no statistics yet!");
      return;
    }

    const foundRankAndStats: {
      rank: number;
      userStats: UserStats;
    } | null = findUserStatsAndRank(guildStats, userId);
    if (!foundRankAndStats) {
      await interaction.reply("Could not find user stats.");
      return;
    }

    const { rank, userStats } = foundRankAndStats;

    if (debug) {
      const outputMessage: string = JSON.stringify(userStats, null, 4);
      const outputArray: RegExpMatchArray | [] =
        outputMessage.match(REGEX_DISCORD_MESSAGE_LENGTH_SHORT) ?? [];
      for (const r of outputArray) {
        await interaction.followUp(wrapCodeBlockString(r, "json"));
      }
      return;
    }

    const outputMessage = formatProfileOutput(
      interaction,
      context,
      userId,
      userStats,
      rank
    );

    await interaction.followUp(
      `Showing profile for ${getNicknameFromInteraction(
        interaction,
        userId
      )}...`
    );

    const outputArray: RegExpMatchArray | [] =
      outputMessage.match(REGEX_DISCORD_MESSAGE_LENGTH_SHORT) ?? [];
    for (const r of outputArray) {
      await interaction.followUp({
        content: wrapCodeBlockString(r, "ansi"),
        ephemeral: false,
      });
    }
    return;
  },
};

function findUserStatsAndRank(
  guildStats: GuildStats,
  userId: string
): {
  rank: number;
  userStats: UserStats;
} | null {
  const ranked: [string, UserStats, number][] = orderStatsByRank(guildStats);
  const found: [string, UserStats, number] | undefined = ranked.find(
    ([id]) => id === userId
  );
  return found ? { rank: found[2] + 1, userStats: found[1] } : null;
}

function formatProfileOutput(
  interaction: Interaction,
  context: BotContext,
  userId: string,
  userStats: UserStats,
  rank: number
) {
  return `=== Profile for ${getNicknameFromInteraction(
    interaction,
    userId
  )}, #${rank} on server ===\n    Messages: ${
    userStats.messages
  }\n    Voice Time: ${formatTime(userStats.voiceTime)}\n\n    Level: ${
    userStats.level
  } (${userStats.levelXP.toFixed(0)}/${getRequiredExperience(
    userStats.level,
    context.config
  )})\n    Ranking: ${getLevelName(
    userStats.level
  )} (${userStats.totalXP.toFixed(0)} XP)`;
}
