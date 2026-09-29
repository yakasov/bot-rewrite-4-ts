import { Collection, Guild, GuildBasedChannel } from "discord.js";
import { BotContext } from "../types/BotContext";
import { addToStats } from "./statsHelpers";

/**
 * Task for checking voice channels - if anybod is in a voice channel,
 * raise addToStats with inVoiceChannel
 * 
 * @param context 
 */
export function checkVoiceChannels(context: BotContext): void {
  const guilds: Collection<string, Guild> = context.client.guilds.cache;

  for (const guild of guilds.values()) {
    const voiceChannels = guild.channels.cache.filter(
      (channel: GuildBasedChannel) => channel.isVoiceBased()
    );

    for (const channel of voiceChannels.values()) {
      for (const member of channel.members.values()) {
        if (member.user.bot) continue;

        addToStats(
          {
            guildId: guild.id,
            type: "inVoiceChannel",
            userId: member.user.id,
          },
          context
        );
      }
    }
  }
}
