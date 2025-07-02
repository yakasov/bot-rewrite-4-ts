import { BotContext } from "../types/BotContext";
import { GuildStats, StatsEvent, UserStats } from "../types/Stats";

export function addToStats(event: StatsEvent, context: BotContext): void {
  if (!context.isStatsEnabled || !context.stats) return;

  let guildStats: GuildStats | undefined = context.stats[event.guildId];
  if (!guildStats) {
    guildStats = {
      guild: {
        allowResponses: true,
        rankUpChannel: "",
      },
      users: {},
    } as GuildStats;
    context.stats[event.guildId] = guildStats;
  }

  let userStats: UserStats | undefined =
    context.stats[event.guildId].users[event.userId];
  if (!userStats) {
    userStats = {
      joinTime: 0,
      lastGainTime: 0,
      level: 0,
      levelXP: 0,
      messages: 0,
      previousMessages: 0,
      previousVoiceTime: 0,
      name: "",
      totalXP: 0,
      voiceTime: 0,
    } as UserStats;
    context.stats[event.guildId].users[event.userId] = userStats;
  }

  switch (event.type) {
    case "message":
      if (
        getDateNowInSeconds() - userStats.lastGainTime <
        context.config.stats.messageXPGainCooldown
      )
        return;

      userStats.lastGainTime = getDateNowInSeconds();
      userStats.messages++;
      break;

    case "joinedVoiceChannel":
      userStats.joinTime = getDateNowInSeconds();
      break;

    case "inVoiceChannel":
      if (context.uptime < 10) {
        userStats.joinTime = getDateNowInSeconds();
      }

      const joinTime: number =
        userStats.joinTime === 0 ? getDateNowInSeconds() : userStats.joinTime;
      userStats.voiceTime += Math.floor(getDateNowInSeconds() - joinTime);
      break;

    case "leftVoiceChannel":
      userStats.voiceTime += Math.floor(
        getDateNowInSeconds() - userStats.joinTime
      );
      break;

    default:
      break;
  }

  // updateScores
  // saveStats
}

// function orderStatsByRank ?

function getDateNowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
