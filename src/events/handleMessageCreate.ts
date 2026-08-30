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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const refetchedMessage = await message.channel.messages.fetch(message.id);
    if (
      refetchedMessage.embeds &&
      refetchedMessage.embeds.length > 0 &&
      refetchedMessage.embeds[0].data &&
      refetchedMessage.embeds[0].data.description
    ) {
      try {
        const detection = await cld.detect(
          refetchedMessage.embeds[0].data.description
        );

        if (
          detection.languages.some(
            (lang) => lang.code != "en" && lang.percent > 33
          )
        ) {
          const translation = await tr(
            refetchedMessage.embeds[0].data.description
          );

          const repliedMessage: Message = await refetchedMessage.reply(translation.text.split("**[💬]")[0]);
          await repliedMessage.suppressEmbeds();
        }
      } catch (error: unknown) {
        console.error(error);
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
