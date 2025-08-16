import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  BOOKS_SEARCH_URL,
  REGEX_DISCORD_MESSAGE_LENGTH_SHORT,
  REGEX_GOOGLE_BOOKS_PATTERN,
} from "../consts/constants";
import { wrapCodeBlockString } from "../util/commonFunctions";

export async function googleBooksInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_GOOGLE_BOOKS_PATTERN.exec(message.content)) !== null) {
    const bookName: string | undefined = match.groups?.name?.trim();
    const bookAuthor: string | undefined = match.groups?.author?.trim();

    if (!bookName) continue;

    promises.push(googleBooksSearch(message, bookName, bookAuthor));
  }

  await Promise.all(promises);
}

export async function googleBooksSearch(
  message: Message,
  name: string,
  author: string | undefined
): Promise<void> {
  let url = `${BOOKS_SEARCH_URL}intitle:${encodeURIComponent(name)}`;
  if (author) {
    url += `+inauthor:${author}`;
  }

  const result = await fetch(url)
    .then((response: Response) => response.json())
    .then((json: any) => {
      if (json.items) {
        return json.items.filter((i: any) => i && i.volumeInfo)[0];
      }

      return undefined;
    });

  await googleBooksFound(message, result);
}

export async function googleBooksFound(
  message: Message,
  book: any
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  if (!book) {
    message.channel.send("bookless");
    return;
  }

  if (message.content.slice(-1) === "*") {
    const debugOutput = JSON.stringify(book, null, 4);
    const outputArray: RegExpMatchArray | [] =
      debugOutput.match(REGEX_DISCORD_MESSAGE_LENGTH_SHORT) ?? [];
    for (const r of outputArray) {
      await message.channel.send(wrapCodeBlockString(r, "json"));
    }
    return;
  }

  const info = book.volumeInfo;
  const description = `${info.authors?.join(", ") ?? "Unknown authors"}\n\n${
    book.searchInfo?.textSnippet ?? info.description
  }`;
  const footer = `Published by ${info.publisher ?? "an unknown publisher"} ${
    (info.publishedDate ?? "-").includes("-") ? "on" : "in"
  } ${info.publishedDate ?? "an unknown date"}. ${info.pageCount ?? "?"} pages`;
  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(info.title)
    .setURL(info.infoLink)
    .setDescription(description)
    .setFooter({ text: footer })
    .setImage(info.imageLinks?.thumbnail);

  await message.channel.send({
    embeds: [embed],
  });
}
