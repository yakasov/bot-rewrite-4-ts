import {
  SlashCommandBuilder,
  MessageFlags,
  ChatInputCommandInteraction,
  Interaction,
  User,
} from "discord.js";
import { REGEX_DISCORD_MESSAGE_LENGTH_SHORT } from "../../consts/constants";
import {
  getNicknameFromInteraction,
  orderStatsByRank,
} from "../../stats/statsHelpers";
import { wrapCodeBlockString } from "../../util/commonFunctions";
import { BotContext } from "../../types/BotContext";
import { GuildStats, UserStats } from "../../types/Stats";

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Shows personal statistics")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to get the profile of")
    )
    .addBooleanOption((opt) =>
      opt.setName("debug").setDescription("Whether to print the raw statistics")
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let user: string | null = interaction.options.getUser("user")?.id ?? null;
    const debug = interaction.options.getBoolean("debug") ?? false;
    if (!user) return;

    const guildStats: GuildStats | undefined =
      context.stats?.[interaction.guild?.id!];
    if (!guildStats) {
      interaction.reply("This server has no statistics yet!");
      return;
    }

    const userId: string = user ?? interaction.user.id;
    if (!guildStats.users[userId]) {
      interaction.reply("This user has no statistics yet!");
      return;
    }

    const found: {
      rank: number;
      userStats: UserStats;
    } | null = findUserStatsAndRank(guildStats, userId);
    if (!found) {
      interaction.reply("Could not find user stats.");
      return;
    }

    const { userStats, rank } = found;
    const allUserStats: UserStats = guildStats.users[userStats[0]];

    if (debug) {
      const outputMessage: string = JSON.stringify(allUserStats, null, 4);
      const outputArray: RegExpMatchArray | [] = outputMessage.match(
        REGEX_DISCORD_MESSAGE_LENGTH_SHORT
      ) ?? []
      for (const r of outputArray) {
        await interaction.followUp(wrapCodeBlockString(r, "json"));
      }
      return;
    }

    const outputMessage = formatProfileOutput(
      interaction,
      userStats,
      allUserStats,
      rank
    );

    await interaction.followUp(
      `Showing profile for ${getNicknameFromInteraction(
        interaction,
        userStats[0].toString()
      )}...`
    );

    const outputArray: RegExpMatchArray | [] = outputMessage.match(REGEX_DISCORD_MESSAGE_LENGTH_SHORT) ?? [];
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
  const found: [string, UserStats, number] | undefined = ranked.find(([id]) => id === userId);
  return found ? { rank: found[2] + 1, userStats: found[1] } : null;
}

function formatProfileOutput(interaction: Interaction, userStats: (string | number)[], allUserStats: UserStats, rank: number) {
  return `=== Profile for ${getNicknameFromInteraction(
    interaction,
    userStats[0].toString()
  )}, #${rank} on server ===\n    Messages: ${
    allUserStats.messages
  }\n    Voice Time: ${formatTime(
    allUserStats.voiceTime
  )}\n\n    Level: ${allUserStats.level} (${allUserStats.levelExperience}/${getRequiredExperience(
    allUserStats.level
  )})\n    Title: ${getTitle(
    allUserStats
  )}\n    Ranking: ${getLevelName(allUserStats.level)} (${
    allUserStats.totalExperience
  } XP)`;
}