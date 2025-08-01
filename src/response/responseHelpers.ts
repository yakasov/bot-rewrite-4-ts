import { Message } from "discord.js";

export function getNicknameFromMessage(message: Message): string {
  const member =
    message.guild?.members.cache
      .filter((m) => m.id === message.author.id)
      .first() ?? message.author;
  return `${member ? member.displayName : "???"}`;
}
