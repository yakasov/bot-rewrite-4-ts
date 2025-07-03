import { BotContext } from "../types/BotContext";
import { GuildStats, Stats, StatsEvent, UserStats } from "../types/Stats";
import {
  calculateExperience,
  getRequiredExperienceCumulative,
  levelUp,
} from "./experienceHelpers";

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

  checkAllUserStats(context.stats, context);
}

function checkAllUserStats(stats: Stats, context: BotContext): void {
  for (const [guildId, guildStats] of Object.entries(stats)) {
    const users: { [userId: string]: UserStats } = guildStats.users;

    for (const [userId, userStats] of Object.entries(users)) {
      calculateExperience(userStats, context);

      if (
        userStats.totalXP >=
        getRequiredExperienceCumulative(userStats.level, context.config)
      ) {
        levelUp(guildId, userId, context);
      }
    }
  }
}

function orderStatsByRank(guildStats: GuildStats): [string, number][] {
  const users = guildStats.users;
  const userXPPairs: [string, number][] = Object.entries(users).map(
    ([userId, userStats]) => [userId, userStats.totalXP]
  );
  return userXPPairs.sort(([, first], [, second]) => second - first);
}

function getDateNowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
