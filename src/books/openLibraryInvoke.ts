import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  BOOKS_SEARCH_OPENLIBRARY_URL,
  REGEX_BOOKS_PATTERN,
  REGEX_DISCORD_MESSAGE_LENGTH_SHORT,
} from "../consts/constants";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";
import { wrapCodeBlockString } from "../util/commonFunctions";
import { openLibraryShowBookList } from "./openLibraryShowBookList";

export async function openLibraryInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_BOOKS_PATTERN.exec(message.content)) !== null) {
    const searchMultiple: boolean = match.groups?.name[0] === "?";
    const bookName: string | undefined = match.groups?.name
      ?.substring(Number(searchMultiple))
      .trim();
    const bookAuthor: string | undefined = match.groups?.author?.trim();

    if (!bookName) continue;

    promises.push(
      openLibrarySearch(message, bookName, bookAuthor, searchMultiple)
    );
  }

  await Promise.all(promises);
}

export async function openLibrarySearch(
  message: Message,
  input: string,
  author: string | undefined,
  searchMultiple: boolean = false
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  let url = `${BOOKS_SEARCH_OPENLIBRARY_URL}${encodeURIComponent(input)}`;
  if (author) {
    url += `&author:${encodeURIComponent(author)}`;
  }

  const results = await fetch(url)
    .then((response: Response) => response.json())
    .then((json: OpenLibraryTypes.Response) => json.docs);

  if (!results || results.length === 0) {
    message.channel.send(
      `Could not find book from query \`${input}\` by \`${
        author ?? "any author"
      }\``
    );
    return;
  }

  if (results.length > 1 && searchMultiple) {
    await openLibraryShowBookList(message, results, input);
    return;
  }

  await openBooksFound(message, results[0]);
}

export async function openBooksFound(
  message: Message,
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
              value: getDescription(workInfo.description),
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

  await message.channel.send({
    embeds: [embed],
  });
}

function getDescription(description: OpenLibraryTypes.Work["description"]) {
  const descriptionString =
    typeof description === "string" ? description : description!.value;
  return descriptionString.length > 320
    ? descriptionString.slice(0, 320) + "..."
    : descriptionString;
}
