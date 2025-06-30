import { Message, EmbedBuilder } from "discord.js";

export function scryfallNoCardFound(message: Message, cardName: string): void {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const embed: EmbedBuilder = new EmbedBuilder().setDescription(
    `No card found for "${cardName}"`
  );

  message.channel.send({ embeds: [embed] });
}