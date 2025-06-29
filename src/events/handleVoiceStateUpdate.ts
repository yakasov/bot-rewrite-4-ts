import { VoiceState } from "discord.js";

export async function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
  if (newState.member?.user.bot) return;

  if (oldState.channel && !newState.channel) {
    addToStats({
      guildId: newState.guild.id,
      type: "leftVoiceChannel",
      userId: newState.member?.id
    });
  } else if (!oldState.channel && newState.channel) {
    addToStats({
      guildId: newState.guild.id,
      type: "joinedVoiceChannel",
      userId: newState.member?.id
    });
  }
}