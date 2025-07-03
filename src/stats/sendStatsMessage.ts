import { Guild, GuildBasedChannel, User } from "discord.js";
import { BotContext } from "../types/BotContext";
import { GuildStats, StatsMessage } from "../types/Stats";

export async function sendMessage(
  messageEvent: StatsMessage,
  context: BotContext
): Promise<void> {
  const guild: Guild = await context.client.guilds.fetch(messageEvent.guildId);
  const user: User | undefined = guild.members.cache.get(
    messageEvent.userId
  )?.user;
  const guildStats: GuildStats | undefined = context.stats?.[guild.id];

  if (!guild || !user || !guildStats) {
    console.error(
      `Guild, user, or guild stats not found for guildId: ${messageEvent.guildId}, userId: ${messageEvent.userId}`
    );
    return;
  }

  const channel: GuildBasedChannel | null = await guild.channels.fetch(
    guildStats.guild.rankUpChannel
  );

  if (channel && guildStats.guild.rankUpChannel) {
    if (!channel.isTextBased() || channel.isDMBased()) return;

    channel.send(
      `## ${messageEvent.subject}!\n\`\`\`ansi\n${user.displayName} has reached ${messageEvent.accolade} (${messageEvent.title})!\`\`\``
    );
  }
}
