import { Message } from "discord.js";
import { BotContext } from "../types/BotContext";
import { scryfallInvoke } from "../scryfall/scryfallInvoke";
import { addToStats } from "../stats/statsHelpers";

export async function handleMessageCreate(
  message: Message,
  context: BotContext
): Promise<void> {
  if (message.author.bot || !message.guild) return;

  await scryfallInvoke(message);
  await checkMessageInvoke();

  addToStats(
    {
      guildId: message.guild.id,
      type: "message",
      userId: message.author.id,
    },
    context
  );
}
