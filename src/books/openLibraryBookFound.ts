import { Message, EmbedBuilder } from "discord.js";
import { REGEX_DISCORD_MESSAGE_LENGTH_SHORT } from "../consts/constants";
import type { Book, Work } from "../types/books/OpenLibraryResponse.d.ts";
import { wrapCodeBlockString } from "../util/commonFunctions";
import { isSendableChannel } from "../util/typeGuards";
import { getSourceImage, getSourceDescription } from "./openLibraryHelpers";
import { getWork } from "./openLibraryFetchers";

export async function openBooksFound(
  message: Message,
  replyMessage: Message,
  book: Book
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  if (message.content.slice(-1) === "*") {
    const debugOutput = JSON.stringify(book, null, 4);
    const outputArray: RegExpMatchArray | [] =
      debugOutput.match(REGEX_DISCORD_MESSAGE_LENGTH_SHORT) ?? [];
    for (const r of outputArray) {
      await message.channel.send(wrapCodeBlockString(r, "json"));
    }
    return;
  }

  const workInfo: Work = await getWork(book.key);
  const authorString = book.author_name?.join(", ") ?? "Unknown Authors";

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(book.title)
    .setURL(`https://openlibrary.org${book.key}`)
    .setDescription(authorString)
    .setImage(await getSourceImage(book))
    .addFields(
      [
        {
          name: "Description",
          value: await getSourceDescription(book, workInfo),
        },
        workInfo.subjects
          ? {
              name: "Tags",
              value: workInfo.subjects.slice(0, 5).join(", "),
            }
          : null,
      ].filter((a) => a !== null)
    );

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}
