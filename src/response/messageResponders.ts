import { Message, StickerResolvable } from "discord.js";
import chanceResponsesJson from "../../resources/chanceResponses.json";
import { ChanceResponse } from "../types/JSON";
import { getNicknameFromMessage } from "./responseHelpers";

const chanceResponses: { [key: string]: ChanceResponse } =
  chanceResponsesJson as {
    [key: string]: ChanceResponse;
  };

export async function replyWithHypeMessage(message: Message): Promise<void> {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const hypeEntries: [string, ChanceResponse][] = Object.entries(
    chanceResponses
  ).filter(([key]) => key.startsWith("hype"));
  const randomEntry: string =
    hypeEntries[Math.floor(Math.random() * hypeEntries.length)][1].string;
  message.channel.send(randomEntry);
}

export async function sendCustomResponse(
  message: Message,
  key: string,
  value: string
): Promise<void> {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  let response: string = value;
  if (response.includes("{AUTHOR}")) {
    response = response.replace("{AUTHOR}", getNicknameFromMessage(message));
  }

  if (response.includes("{FOLLOWING}")) {
    let lastMessage: string = "";
    if (
      message.content.toLowerCase().trim() === key ||
      message.content.toLowerCase().trim().endsWith(key)
    ) {
      lastMessage = await message.channel.messages
        .fetch({ limit: 2 })
        .then((c) => {
          const lastMsg: Message | undefined = [...c.values()].pop();
          return lastMsg ? getNicknameFromMessage(lastMsg) : "???";
        });
    }

    const following: string = message.content
      .toLowerCase()
      .split(key)
      .slice(1)
      .join(key);
    response = response.replace(
      "{FOLLOWING}",
      lastMessage || !following.trim()
        ? lastMessage ?? getNicknameFromMessage(message)
        : following.trim()
    );
  }

  // TODO: This needs checking, not sure get as StickerResolvable works for sending
  if (response.includes("{STICKER:")) {
    const stickerId: string = response.split(":")[1].slice(0, -1);
    const sticker: StickerResolvable = message.guild?.stickers.cache.get(
      stickerId
    ) as StickerResolvable;
    if (sticker) {
      message.channel.send({ stickers: [sticker] });
    }
    return;
  }

  message.channel.send(response);
}
