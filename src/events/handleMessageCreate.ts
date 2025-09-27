import { Message } from "discord.js";
import { BotContext } from "../types/BotContext";
import { scryfallInvoke } from "../scryfall/invoke";
import { addToStats } from "../stats/statsHelpers";
import { checkMessageInvoke } from "../response/checkMessageInvoke";
import { goodreadsInvoke } from "../books/goodreads/invoke";

export async function handleMessageCreate(
  message: Message,
  context: BotContext
): Promise<void> {
  if (message.author.bot || !message.guild) return;

  await scryfallInvoke(message);
  await goodreadsInvoke(message);
  await checkMessageInvoke(message, context);

  addToStats(
    {
      guildId: message.guild.id,
      type: "message",
      userId: message.author.id,
    },
    context
  );
}
