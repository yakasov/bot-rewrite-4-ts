import { VoiceState } from "discord.js";
import { addToStats } from "../stats/statsHelpers";
import { BotContext } from "../types/BotContext";

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  context: BotContext
): Promise<void> {
  if (newState.member?.user.bot) return;

  if (oldState.channel && !newState.channel) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "leftVoiceChannel",
        userId: newState.member?.id!,
      },
      context
    );
  } else if (!oldState.channel && newState.channel) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "joinedVoiceChannel",
        userId: newState.member?.id!,
      },
      context
    );
  }
}
