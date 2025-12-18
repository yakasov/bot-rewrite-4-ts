import { Message, StickerResolvable } from "discord.js";
import chanceResponsesJson from "../../resources/chanceResponses.json";
import type { ChanceResponse } from "../types/JSON.d.ts";
import { getNicknameFromMessage } from "./responseHelpers";
import type { BotContext } from "../types/BotContext.d.ts";
import { isSendableChannel } from "../util/typeGuards";
import moment from "moment-timezone";

const chanceResponses: Record<string, ChanceResponse> =
  chanceResponsesJson as Record<string, ChanceResponse>;

export function getRandomResponse(filter: string = "hype"): string {
  const responses: [string, ChanceResponse][] = Object.entries(
    chanceResponses
  ).filter(([key]) => (filter.length !== 0 ? key.startsWith(filter) : true));
  const randomEntry: string =
    responses[Math.floor(Math.random() * responses.length)][1].string;

  return randomEntry;
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
        if (response.targetUserId && response.targetUserId != message.author.id)
          continue;

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

export async function checkMoMessage(message: Message): Promise<boolean> {
  /*
   * This function should return true if:
   * - a ping is sent and the time is before 9am
   * - a reply to a ping is sent, and at least an hour has passed since the ping
   *
   * There is extra handling in the case the replied-to ping message has a time inside it
   * eg <@&1234567890> 12
   * This handling is pretty rough, it just checks each string (surrounded by spaces)
   * and sees if it can be parsed as a number. It won't work for '12pm' or '12:30' but
   * hopefully it's good enough. Worst case it fires by accident
   */
  const isPing = (testMessage: Message) => testMessage.content.includes("<@&");
  const isReply =
    message.reference &&
    message.reference.messageId &&
    message.reference.channelId === message.channel.id;

  const messageMoment: moment.Moment = moment(message.createdTimestamp * 1000);
  const pingTimeCheck = messageMoment.hour() <= 9;

  const replyToPingCheck = async () => {
    if (!isReply) return false;

    const replyMessage: Message = await message.channel.messages.fetch(
      message.reference!.messageId!
    );

    if (isPing(replyMessage)) {
      const replyMessageMoment: moment.Moment = moment(
        replyMessage.createdTimestamp * 1000
      );

      const replyMessageParts: string[] = replyMessage.content.split(" ");
      const replyMessageTime: string | undefined = replyMessageParts.find(
        (s) => !Number.isNaN(s)
      );
      const replyMessageTimeHour: number = replyMessageTime
        ? parseInt(replyMessageTime)
        : replyMessageMoment.hour();

      return messageMoment.hour() >= replyMessageTimeHour + 1;
    }

    return false;
  };

  return (isPing(message) && pingTimeCheck) || (await replyToPingCheck());
}
