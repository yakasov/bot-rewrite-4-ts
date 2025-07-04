import { Message } from "discord.js";
import { BotContext } from "../types/BotContext";
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

const responses: { [key: string]: string } = responsesJson as {
  [key: string]: string;
};

export async function checkMessageInvoke(
  message: Message,
  context: BotContext
): Promise<void> {
  if (context.config.bot.allowResponses) {
    await checkMessageReactions(message, context);
  }

  if (REGEX_STEAM_LINK.test(message.content)) {
    return sendSteamDirectLink(message);
  }

  if (
    TWITTER_LINKS.some((link) => message.content.includes(link)) &&
    message.content.includes("status")
  ) {
    return await swapTwitterLinks(message);
  }

  if (
    message.author.id === THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF &&
    message.content.match(REGEX_TIME_MATCH)
  ) {
    return replyWithHypeMessage(message);
  }

  for (const [key, value] of Object.entries(responses)) {
    if (` ${message.content.toLowerCase()} `.includes(` ${key} `)) {
      await sendCustomResponse(message, key, value);
      return;
    }
  }
}
