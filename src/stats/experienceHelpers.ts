import type { BotContext } from "../types/BotContext.ts";
import type { UserStats } from "../types/Stats.ts";
import { sendMessage } from "./sendStatsMessage";
import ranksJSON from "../../resources/ranks.json";
import { GenericStringObject } from "../types/Generic.js";

/**
 * Recalculates and sets user level XP and total XP.
 * 
 * @param userStats 
 * @param context 
 */
export function calculateExperience(
  userStats: UserStats,
  context: BotContext
): void {
  const experience: number =
    userStats.voiceTime * context.config.stats.voiceChatXPGain +
    userStats.messages * context.config.stats.messageXPGain;

  userStats.levelXP = Math.max(
    experience -
      getRequiredExperienceCumulative(userStats.level - 1, context.config),
    0
  );
  userStats.totalXP = Math.max(experience, userStats.totalXP);
}

/**
 * Calls the update stats function and broadcasts level ups.
 * 
 * @param guildId 
 * @param userId 
 * @param context 
 */
export function levelUp(
  guildId: string,
  userId: string,
  context: BotContext
): void {
  const userStats: UserStats | undefined =
    context.stats?.[guildId]?.users[userId];
  if (!userStats) return;

  updateStatsOnLevelUp(userStats, context.config);

  if (userStats.level % 10 === 0) {
    sendMessage(
      {
        guildId: guildId,
        userId: userId,
        subject: "Level Up",
        accolade: `level ${userStats.level}`,
        title: getLevelName(userStats.level),
      },
      context
    );
  }
}

/**
 * Uses ranks.json for level names
 * 
 * @param level 
 * @returns the level name as a string
 */
export function getLevelName(level: number): string {
  const ranks = ranksJSON as GenericStringObject;
  let nameLevel: number = Math.floor(level / 10) + 1;
  const highestKey: number = parseInt(
    Object.keys(ranks as GenericStringObject).slice(-1)[0]
  );
  if (nameLevel > highestKey) {
    nameLevel = highestKey;
  }
  return `${ranks[`${nameLevel}` as string]}\u001b[0m`;
}

/**
 * Returns the XP required for any one given level.
 * 
 * @param level 
 * @param config - as part of BotContext
 * @returns XP as number
 */
export function getRequiredExperience(
  level: number,
  config: BotContext["config"]
): number {
  return level * config.stats.XPPerLevel;
}

/**
 * Returns the total XP required to reach any one given level.
 * 
 * @param level 
 * @param config - as part of BotContext
 * @returns XP as number
 */
export function getRequiredExperienceCumulative(
  level: number,
  config: BotContext["config"]
): number {
  return (level * ((level + 1) * config.stats.XPPerLevel)) / 2;
}

/**
 * Adjusts user level and level XP on level up
 * 
 * @param userStats 
 * @param config 
 */
export function updateStatsOnLevelUp(
  userStats: UserStats,
  config: BotContext["config"]
): void {
  /*
   * We do it this way so a user can level up multiple times in one go
   * (as opposed to levelXP = 0)
   */
  userStats.levelXP =
    userStats.totalXP -
    getRequiredExperienceCumulative(userStats.level, config);
  userStats.level++;

  if (userStats.levelXP >= getRequiredExperience(userStats.level, config)) {
    updateStatsOnLevelUp(userStats, config);
  }
}
