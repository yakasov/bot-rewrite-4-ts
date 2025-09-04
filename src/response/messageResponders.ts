import { Message, StickerResolvable } from "discord.js";
import chanceResponsesJson from "../../resources/chanceResponses.json";
import type { ChanceResponse } from "../types/JSON.d.ts";
import { getNicknameFromMessage } from "./responseHelpers";
import type { BotContext } from "../types/BotContext.d.ts";
import { isSendableChannel } from "../util/typeGuards";

const chanceResponses: Record<string, ChanceResponse> =
  chanceResponsesJson as Record<string, ChanceResponse>;

export async function replyWithHypeMessage(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const hypeEntries: [string, ChanceResponse][] = Object.entries(
    chanceResponses
  ).filter(([key]) => key.startsWith("hype"));
  const randomEntry: string =
    hypeEntries[Math.floor(Math.random() * hypeEntries.length)][1].string;
  await message.channel.send(randomEntry);
}

export async function sendCustomResponse(
  message: Message,
  key: string,
  value: string
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  let response: string = value;
  if (response.includes("{AUTHOR}")) {
    response = response.replace("{AUTHOR}", getNicknameFromMessage(message));
  }

  if (response.includes("{FOLLOWING}")) {
    let lastMessage = "";
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
      await message.channel.send({ stickers: [sticker] });
    }
    return;
  }

  await message.channel.send(response);
}

export async function checkMessageReactions(
  message: Message,
  context: BotContext
): Promise<void> {
  // Fix for deleted message - return if message fetch fails
  try {
    await message.channel.messages.fetch(message.id);
  } catch {
    return;
  }

  const roll: number = Math.random() * 100;
  const initialRoll: number = Math.random() * 100;

  if (initialRoll < (context.config.bot.responseChance ?? 0)) {
    for (const response of context.rollTable) {
      if (roll < response.chance) {
        if (response.targetUserId && response.targetUserId != message.author.id) continue;

        try {
          switch (response.type) {
            case "message":
              await message.reply(response.string);
              break;
            case "reaction":
              await message.react(response.string);
              break;
            default:
              break;
          }

          return;
        } catch (err) {
          console.error(err);
          return;
        }
      }
    }
  }
}
