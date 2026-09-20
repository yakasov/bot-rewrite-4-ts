import { VoiceState } from "discord.js";
import { addToStats } from "../stats/statsHelpers";
import type { BotContext } from "../types/BotContext.d.ts";
import { THIS_ID_SHOULD_BE_VOICE_PROCESSED } from "../consts/constants";
import {
  AudioPlayer,
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  context: BotContext
): Promise<void> {
  if (newState.member?.user.bot || !newState.member) return;

  if (oldState.channel && !newState.channel) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "leftVoiceChannel",
        userId: newState.member.id,
      },
      context
    );

    if (newState.member.id === THIS_ID_SHOULD_BE_VOICE_PROCESSED) {
      const conn: VoiceConnection | undefined = getVoiceConnection(
        newState.guild.id
      );
      if (conn) {
        conn.destroy();
      }
    }
  } else if (!oldState.channel && newState.channel) {
    addToStats(
      {
        guildId: newState.guild.id,
        type: "joinedVoiceChannel",
        userId: newState.member.id,
      },
      context
    );

    if (newState.member.id === THIS_ID_SHOULD_BE_VOICE_PROCESSED) {
      const player: AudioPlayer = createAudioPlayer();
      joinVoiceChannel({
        adapterCreator: newState.guild.voiceAdapterCreator,
        channelId: newState.member.voice.channelId!,
        guildId: newState.guild.id,
        selfDeaf: false
      }).subscribe(player);
    }
  }
}
