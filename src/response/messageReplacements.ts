import { Message } from "discord.js";
import { REGEX_STEAM_LINK, STEAM_URL_LINK } from "../consts/constants";
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

  const content: string = `${getNicknameFromMessage(
    message
  )} sent:\n${message.content
    .replace("https://x.com/", "https://fixupx.com/")
    .replace("https://twitter.com/", "https://fxtwitter.com/")}`;

  if (message.reference && message.reference.channelId === message.channel.id) {
    // messageId is a snowflake? so hopefully enforcing it as not-null works
    const replyMessage: Message = await message.channel.messages.fetch(
      message.reference.messageId!
    );
    await replyMessage.reply(content);
  } else {
    await message.channel.send(content);
  }

  // TODO: if fixupx fails, don't delete original message

  await message.delete().catch(console.error);
}
