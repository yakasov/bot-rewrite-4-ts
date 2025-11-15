import { GuildMember, Interaction } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import type { GuildStats, Stats, StatsEvent, UserStats } from "../types/Stats.d.ts";
import {
  calculateExperience,
  getRequiredExperienceCumulative,
  levelUp,
} from "./experienceHelpers";
import { REGEX_SANITIZE_STRING } from "../consts/constants";

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

  if (event.type === "guildInit") return;

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

      userStats.voiceTime += Math.floor(
        getDateNowInSeconds() -
          (userStats.joinTime === 0
            ? getDateNowInSeconds()
            : userStats.joinTime)
      );
      userStats.joinTime = getDateNowInSeconds();
      break;

    case "leftVoiceChannel":
      userStats.voiceTime += Math.floor(
        getDateNowInSeconds() - userStats.joinTime
      );
      break;

    default:
      break;
  }

  checkAllUserStats(context);
}

export function checkAllUserStats(context: BotContext): void {
  const stats: Stats | undefined = context.stats;
  if (!stats) return;

  for (const [guildId, guildStats] of Object.entries(stats)) {
    const users: Record<string, UserStats> = guildStats.users;

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

export function orderStatsByRank(
  guildStats: GuildStats
): [string, UserStats, number][] {
  return Object.entries(guildStats.users)
    .sort(([, first], [, second]) => second.totalXP - first.totalXP)
    .map((array: [string, UserStats], index: number) => [...array, index]);
}

export function getDateNowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function getNicknameFromInteraction(
  interaction: Interaction,
  id = "",
  sanitize = false
): string | undefined {
  // Used for fetching nickname from interaction
  const member: GuildMember | undefined = interaction.guild?.members.cache
    .filter((m) => m.id === (id !== "" ? id : interaction.user.id))
    .first();
  if (!member) return;

  let name: string = member ? member.displayName : "???";
  if (sanitize) {
    name = name.replace(REGEX_SANITIZE_STRING, "");
  }
  return name;
}

export function formatTime(seconds: number): string {
  const totalSeconds = seconds;
  const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const secs = totalSeconds % 60;
  
  return `${months}m ${days}d ${hours}h ${minutes}m ${secs}s`;
}
