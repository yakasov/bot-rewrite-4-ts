import { Guild, GuildBasedChannel, User } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import type { GuildStats, StatsMessage } from "../types/Stats.d.ts";
import { isSendableChannel } from "../util/typeGuards";
import { wrapCodeBlockString } from "../util/commonFunctions.js";

/**
 * Sends a level up message in the configured level up channel.
 * 
 * @param messageEvent - properties required to build the level up message
 * @param context 
 */
export async function sendMessage(
  messageEvent: StatsMessage,
  context: BotContext
): Promise<void> {
  const guild: Guild = await context.client.guilds.fetch(messageEvent.guildId);
  const user: User | undefined = guild.members.cache.get(
    messageEvent.userId
  )?.user;
  const guildStats: GuildStats | undefined = context.stats?.[guild.id];

  if (!guild || !user || !guildStats || !guildStats.guild.rankUpChannel) {
    console.error(
      `Guild, user, or guild stats not found for guildId: ${messageEvent.guildId}, userId: ${messageEvent.userId}`
    );
    return;
  }

  const channel: GuildBasedChannel | null = await guild.channels.fetch(
    guildStats.guild.rankUpChannel
  );

  if (channel) {
    if (!isSendableChannel(channel)) return;

    const message = `${user.displayName} has reached ${messageEvent.accolade} (${messageEvent.title})!`;

    await channel.send(
      `## ${messageEvent.subject}!\n${wrapCodeBlockString(message, "ansi")}`
    );
  }
}
