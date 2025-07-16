import { Channel } from "discord.js";

export function isSendableChannel(
  channel: Channel
): channel is Extract<typeof channel, { send: Function }> {
  return (
    channel.isTextBased() &&
    !channel.isDMBased() &&
    typeof (channel as any).send === "function"
  );
}
