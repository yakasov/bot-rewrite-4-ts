import {
  Channel,
  Message,
  MessageCreateOptions,
  MessagePayload,
} from "discord.js";

/**
 * Checks whether a Discord channel is 'sendable', ie whether the bot can actually use the channel.
 * Without this, .send() and .reply() functions will not be available.
 * 
 * @param channel 
 * @returns whether the channel supports the aforementioned functions
 */
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
