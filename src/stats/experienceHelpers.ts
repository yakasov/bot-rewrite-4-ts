import { BotContext } from "../types/BotContext";
import { UserStats } from "../types/Stats";
import { sendMessage } from "./sendStatsMessage";
import ranksJSON from "../../resources/ranks.json";

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

function getLevelName(level: number): string {
  const ranks = ranksJSON as { [key: string]: string };
  let nameLevel: number = Math.floor(level / 10) + 1;
  const highestKey: number = parseInt(
    Object.keys(ranks as { [key: string]: string }).slice(-1)[0]
  );
  if (nameLevel > highestKey) {
    nameLevel = highestKey;
  }
  return `${ranks[`${nameLevel}` as string]}\u001b[0m`;
}

function getRequiredExperience(
  level: number,
  config: BotContext["config"]
): number {
  return level * config.stats.XPPerLevel;
}

export function getRequiredExperienceCumulative(
  level: number,
  config: BotContext["config"]
): number {
  return (level * ((level + 1) * config.stats.XPPerLevel)) / 2;
}

function updateStatsOnLevelUp(
  userStats: UserStats,
  config: BotContext["config"]
): void {
  // We do it this way so a user can level up multiple times in one go
  userStats.levelXP =
    userStats.totalXP -
    getRequiredExperienceCumulative(userStats.level, config);
  userStats.level++;

  if (userStats.levelXP >= getRequiredExperience(userStats.level, config)) {
    updateStatsOnLevelUp(userStats, config);
  }
}
