import { Message } from "discord.js";
import {
  REGEX_STEAM_LINK,
  STEAM_URL_LINK,
  TWITTER_LINKS,
} from "../consts/constants";
import { getNicknameFromMessage } from "./responseHelpers";
import { isSendableChannel } from "../util/typeGuards";

export async function sendSteamDirectLink(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const steamLink: string =
    message.content.split(" ").find((word) => REGEX_STEAM_LINK.test(word)) ??
    message.content;
  await message.channel.send(
    `Embedded link: ${STEAM_URL_LINK}${encodeURIComponent(steamLink)}`
  );
}

export async function swapTwitterLinks(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  /*
   * Kind of messy but here's the reasoning:
   *
   * We want to replace Twitter links that contain 'status' in them
   * using the regex from TWITTER_LINKS.
   * This therefore works for X and Twitter.
   *
   * A valid tweet will have 'status' in it, hence the requirement.
   * Otherwise, we don't want to do any replacement.
   *
   * So we split the message content, check each entry for 'status',
   * and if true, we can apply the regex replacement, but only
   * for the matching regex (since 'for of TWITTER_LINKS' will try it twice).
   */
  let contentArray: string[] = message.content.split(" ");
  let replacedContentArray: string[] = [];
  for (let word of contentArray) {
    if (word.includes("status")) {
      for (const [replacement, regex] of Object.entries(TWITTER_LINKS)) {
        if (regex.test(word)) {
          replacedContentArray.push(word.replace(regex, replacement));
        }
      }
    } else {
      replacedContentArray.push(word);
    }
  }

  const content: string = `${getNicknameFromMessage(
    message
  )} sent:\n${replacedContentArray.join(" ")}`;

  if (message.reference && message.reference.channelId === message.channel.id) {
    // messageId is a snowflake? so hopefully enforcing it as not-null works
    const replyMessage: Message = await message.channel.messages.fetch(
      message.reference.messageId!
    );
    await replyMessage.reply(content);
  } else {
    await message.channel.send(content);
  }

  const lastMessage: Message | undefined = await message.channel.messages
    .fetch({ limit: 2 })
    .then((c) => [...c.values()].pop());

  // If we can't check whether the replacement worked, don't delete any messages
  if (!lastMessage) return;

  if (
    lastMessage.embeds[0]?.data?.description?.includes(
      "Sorry, that post doesn't exist :("
    )
  ) {
    await lastMessage.delete().catch(console.error);
    return;
  }

  await message.delete().catch(console.error);
}
