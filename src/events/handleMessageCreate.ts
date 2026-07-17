import { Message } from "discord.js";
import { BotContext } from "../types/BotContext";
import { scryfallInvoke } from "../scryfall/invoke";
import { addToStats } from "../stats/statsHelpers";
import { checkMessageInvoke } from "../response/checkMessageInvoke";
import { goodreadsInvoke } from "../books/goodreads/invoke";
import { movieInvoke } from "../movies/invoke";
import tr from "googletrans";
import cld from "cld";

export async function handleMessageCreate(
  message: Message,
  context: BotContext
): Promise<void> {
  if (message.author.bot) {
    if (message.embeds && message.embeds.length > 0 && message.embeds[0].data && message.embeds[0].data.description) {
      const detection = await cld.detect(message.embeds[0].data.description);

      if (detection.languages.some(lang => lang.code != "en" && lang.percent > 33)) {
        const translation = await tr(message.embeds[0].data.description);

        await message.reply(translation.text.split("**[💬]")[0]);
      }
    }

    return;
  }

  if (!message.guild) return;

  await scryfallInvoke(message);
  await goodreadsInvoke(message);
  await movieInvoke(message);
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
