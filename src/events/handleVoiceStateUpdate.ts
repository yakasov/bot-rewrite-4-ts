import { VoiceState } from "discord.js";
import { addToStats } from "../stats/statsHelpers";
import type { BotContext } from "../types/BotContext.d.ts";
import { THIS_ID_SHOULD_BE_VOICE_PROCESSED } from "../consts/constants";
import type { VoiceRecognitionManager } from "../voice/voiceRecognitionManager";

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  context: BotContext,
  voiceRecognitionManager: VoiceRecognitionManager
): Promise<void> {
  if (newState.member?.user.bot || !newState.member) return;

  if (oldState.channelId && !newState.channelId) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "leftVoiceChannel",
        userId: newState.member.id,
      },
      context
    );

    if (newState.member.id === THIS_ID_SHOULD_BE_VOICE_PROCESSED) {
      voiceRecognitionManager.stop(newState.guild.id);
    }
  } else if (!oldState.channelId && newState.channelId) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "joinedVoiceChannel",
        userId: newState.member.id,
      },
      context
    );

    if (newState.member.id === THIS_ID_SHOULD_BE_VOICE_PROCESSED) {
      voiceRecognitionManager.start(newState.guild, newState.channelId);
    }
  } else if (
    oldState.channelId &&
    newState.channelId &&
    oldState.channelId !== newState.channelId &&
    newState.member.id === THIS_ID_SHOULD_BE_VOICE_PROCESSED
  ) {
    voiceRecognitionManager.start(newState.guild, newState.channelId);
  }
}
