import { Message, EmbedBuilder } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";

export function scryfallNoCardFound(message: Message, cardName: string): void {
  if (!isSendableChannel(message.channel)) return;

  const embed: EmbedBuilder = new EmbedBuilder().setDescription(
    `No card found for "${cardName}"`
  );

  message.channel.send({ embeds: [embed] });
}
