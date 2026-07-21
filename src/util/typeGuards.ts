import {
  Channel,
  Message,
  MessageCreateOptions,
  MessagePayload,
} from "discord.js";

export function isSendableChannel(
  channel: Channel | null
): channel is Extract<
  typeof channel,
  {
    send: (
      options: string | MessagePayload | MessageCreateOptions
    ) => Promise<Message<true>> | Promise<Message<false>>;
  }
> {
  return (
    channel != null && 
    channel.isTextBased() &&
    !channel.isDMBased() &&
    typeof (channel).send === "function"
  );
}
