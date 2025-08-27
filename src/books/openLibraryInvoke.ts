import { Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  BOOKS_SEARCH_OPENLIBRARY_URL,
  REGEX_BOOKS_PATTERN,
} from "../consts/constants";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";
import { openLibraryShowBookList } from "./openLibraryShowBookList";
import { openBooksFound } from "./openLibraryBookFound";

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

  const replyMessage = await message.reply(
    `Fetching \`${input}, ${author ?? "any author"}\`...`
  );

  let url = `${BOOKS_SEARCH_OPENLIBRARY_URL}${encodeURIComponent(input)}`;
  if (author) {
    url += `&author:${encodeURIComponent(author)}`;
  }

  const results = await fetch(url)
    .then((response: Response) => response.json())
    .then((json: OpenLibraryTypes.Response) => json.docs);

  if (!results || results.length === 0) {
    replyMessage.edit(
      `Could not find book from query \`${input}\` by \`${
        author ?? "any author"
      }\``
    );
    return;
  }

  if (results.length > 1 && searchMultiple) {
    await openLibraryShowBookList(message, replyMessage, results, input);
    return;
  }

  await openBooksFound(message, replyMessage, results[0]);
}
