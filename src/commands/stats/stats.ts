import {
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";
import type { BotContext } from "../../types/BotContext.d.ts";
import type { GuildStats, TableData } from "../../types/Stats.d.ts";
import {
  formatTime,
  getNicknameFromInteraction,
  orderStatsByRank,
} from "../../stats/statsHelpers";
import { STATS_TOP_SCORES_N } from "../../consts/constants";
import {
  getLevelName,
  getRequiredExperience,
} from "../../stats/experienceHelpers";
import { wrapCodeBlockString } from "../../util/commonFunctions";
import { generateTable } from "../../stats/statsTableGenerator";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show server statistics"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!context.stats || !interaction.guild) return;

    const guildStats = context.stats?.[interaction.guild.id];
    if (!guildStats) {
      await interaction.reply("This server has no statistics yet!");
      return;
    }

    const topScores: [string, number][] = orderStatsByRank(guildStats).map(
      ([user, , rank]) => [user, rank]
    );
    const data: TableData[] = buildTableData(
      topScores,
      guildStats,
      interaction,
      context
    );

    let outputMessage: string = generateTable(data);
    outputMessage += formatUserRankingLine(topScores, guildStats, interaction);

    await interaction.reply(wrapCodeBlockString(outputMessage, "ansi"));
    return;
  },
};

function buildTableData(
  topScores: [string, number][],
  guildStats: GuildStats,
  interaction: Interaction,
  context: BotContext
) {
   
  return topScores.slice(0, STATS_TOP_SCORES_N).map(([userName], i) => ({
    "#": i + 1,
    Name: getNicknameFromInteraction(interaction, userName, true),
    Level: `${guildStats.users[userName].level} (${guildStats.users[
      userName
    ].levelXP.toFixed(0)}/${getRequiredExperience(
      guildStats.users[userName].level,
      context.config
    )} XP)`,
    Msgs: guildStats.users[userName].messages,
    "Voice Time": formatTime(guildStats.users[userName].voiceTime),
    Rank: getLevelName(guildStats.users[userName].level),
  }));
   
}

function formatUserRankingLine(
  topScores: [string, number][],
  guildStats: GuildStats,
  interaction: Interaction
) {
  const userRanking: (string | number)[] | undefined = topScores
    .map(([k, v]: [string, number], i: number) => [k, v, i])
    .find(([k]) => k.toString() === interaction.user.id);
  if (!userRanking) {
    return "";
  }
  return `\nYour ranking (${getNicknameFromInteraction(
    interaction,
    userRanking[0] as string
  )}): #${Number(userRanking[2]) + 1} (${getLevelName(
    guildStats.users[userRanking[0] as string].level
  )}, ${guildStats.users[userRanking[0] as string].totalXP.toFixed(0)} XP)`;
}
