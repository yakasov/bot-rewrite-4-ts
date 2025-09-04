import { Message } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import {
  REGEX_STEAM_LINK,
  REGEX_TIME_MATCH,
  THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF,
  TWITTER_LINKS,
} from "../consts/constants";
import responsesJson from "../../resources/responses.json";
import { sendSteamDirectLink, swapTwitterLinks } from "./messageReplacements";
import {
  checkMessageReactions,
  replyWithHypeMessage,
  sendCustomResponse,
} from "./messageResponders";

const responses: Record<string, string> = responsesJson as Record<string, string>;

export async function checkMessageInvoke(
  message: Message,
  context: BotContext
): Promise<void> {
  if (context.config.bot.allowResponses) {
    await checkMessageReactions(message, context);
  }

  if (REGEX_STEAM_LINK.test(message.content)) {
    await sendSteamDirectLink(message);
    return;
  }

  if (
    Object.values(TWITTER_LINKS).some((regex) => regex.test(message.content)) &&
    message.content.includes("status")
  ) {
    await swapTwitterLinks(message);
    return;
  }

  if (
    message.author.id === THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF &&
    message.content.match(REGEX_TIME_MATCH)
  ) {
    replyWithHypeMessage(message);
    return;
  }

  for (const [key, value] of Object.entries(responses)) {
    if (` ${message.content.toLowerCase()} `.includes(` ${key} `)) {
      await sendCustomResponse(message, key, value);
      return;
    }
  }
}
