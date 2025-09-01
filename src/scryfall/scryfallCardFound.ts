import { Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  set: string | undefined,
  number: number | undefined = undefined
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  await message.channel.send(
    await getCardMessageObject(message, cardName, set, number)
  );
}
