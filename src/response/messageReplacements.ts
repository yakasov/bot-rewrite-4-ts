import { Message, MessageReference } from "discord.js";
import { REGEX_STEAM_LINK, STEAM_URL_LINK } from "../consts/constants";
import { getNicknameFromMessage } from "./responseHelpers";

export function sendSteamDirectLink(message: Message): void {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const steamLink: string =
    message.content.split(" ").find((word) => REGEX_STEAM_LINK.test(word)) ??
    message.content;
  message.channel.send(
    `Embedded link: ${STEAM_URL_LINK}${encodeURIComponent(steamLink)}`
  );
}

export async function swapTwitterLinks(message: Message): Promise<void> {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

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
    replyMessage.reply(content);
  } else {
    message.channel.send(content);
  }

  // TODO: if fixupx fails, don't delete original message

  await message.delete().catch(console.error);
}
