import { GuildMember, Interaction } from "discord.js";
import { BotContext } from "../types/BotContext";
import { GuildStats, Stats, StatsEvent, UserStats } from "../types/Stats";
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
      debugger;
      if (context.uptime < 10) {
        userStats.joinTime = getDateNowInSeconds();
      }

      const joinTime: number =
        userStats.joinTime === 0
          ? (userStats.joinTime = getDateNowInSeconds())
          : userStats.joinTime;
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

  checkAllUserStats(context);
}

export function checkAllUserStats(context: BotContext): void {
  const stats: Stats | undefined = context.stats;
  if (!stats) return;

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
  id: string = "",
  sanitize: boolean = false
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
  const date: Date = new Date();
  date.setSeconds(seconds);
  const unitArray: string[] = date.toISOString().substr(8, 11).split(/:|T/u);
  const days: number = parseInt(unitArray[0], 10) - 1;
  return `${days < 10 ? " " : ""}${days}d ${unitArray[1]}h ${unitArray[2]}m ${
    unitArray[3]
  }s`;
}
