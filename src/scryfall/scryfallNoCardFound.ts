import { Message, EmbedBuilder } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";

export async function scryfallNoCardFound(message: Message, cardName: string): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const embed: EmbedBuilder = new EmbedBuilder().setDescription(
    `No card found for "${cardName}"`
  );

  await message.channel.send({ embeds: [embed] });
}
