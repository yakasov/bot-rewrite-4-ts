import HTMLParser, { HTMLElement } from "node-html-parser";
import { Message, EmbedBuilder } from "discord.js";
import {
  BOOKS_GOODREADS_SEARCH_URL,
  REGEX_DISCORD_MESSAGE_LENGTH_SHORT,
} from "../consts/constants";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";
import { wrapCodeBlockString } from "../util/commonFunctions";
import { isSendableChannel } from "../util/typeGuards";

export async function openBooksFound(
  message: Message,
  replyMessage: Message,
  book: OpenLibraryTypes.Book
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

  const workInfo: OpenLibraryTypes.Work = await fetch(
    `https://openlibrary.org${book.key}.json`
  ).then((response: Response) => response.json());

  const authorString = book.author_name?.join(", ") ?? "Unknown Authors";

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(book.title)
    .setURL(`https://openlibrary.org${book.key}`)
    .setDescription(authorString)
    .setImage(
      `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`
    )
    .addFields(
      [
        workInfo.description
          ? {
              name: "Description",
              value: await getGoodreadsDescription(book, workInfo),
            }
          : null,
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

async function getGoodreadsDescription(
  book: OpenLibraryTypes.Book,
  work: OpenLibraryTypes.Work
): Promise<string> {
  const isbn: string | undefined = book.ia
    ?.find((i) => i.startsWith("isbn_"))
    ?.replace("isbn_", "");

  if (!isbn) {
    return getDescription(work.description);
  }

  const pageHTML: string = await fetch(BOOKS_GOODREADS_SEARCH_URL + isbn).then(
    (response: Response) => response.text()
  );
  const parsedHTML: HTMLElement = HTMLParser(pageHTML);
  const description: string = parsedHTML.querySelectorAll(
    ".DetailsLayoutRightParagraph__widthConstrained"
  )?.[0].innerText;

  if (!description) {
    return getDescription(work.description);
  }

  return shortenDescription(description);
}

function shortenDescription(description: string) {
  return description.length > 1000
    ? description.slice(0, 1000) + "..."
    : description;
}

function getDescription(description: OpenLibraryTypes.Work["description"]) {
  const descriptionString =
    typeof description === "string" ? description : description!.value;
  return shortenDescription(descriptionString);
}
