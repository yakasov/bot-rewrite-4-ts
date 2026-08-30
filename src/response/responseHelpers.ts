import { Message } from "discord.js";

/**
 * Returns the user nickname where available.
 * 
 * @param message 
 */
export function getNicknameFromMessage(message: Message): string {
  const member =
    message.guild?.members.cache
      .filter((m) => m.id === message.author.id)
      .first() ?? message.author;
  return `${member ? member.displayName : "???"}`;
}
