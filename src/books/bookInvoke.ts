import { EmbedBuilder, Message } from "discord.js";
import HTMLParser from "node-html-parser";
import { isSendableChannel } from "../util/typeGuards";
import {
  BOOKS_GOODREADS_SEARCH_URL,
  BOOKS_SEARCH_URL,
  REGEX_DISCORD_MESSAGE_LENGTH_SHORT,
  REGEX_GOOGLE_BOOKS_PATTERN,
} from "../consts/constants";
import { wrapCodeBlockString } from "../util/commonFunctions";
import { GoogleBooksTypes } from "../types/books/GoogleBooksResponse";

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
  if (!isSendableChannel(message.channel)) return;

  let url = `${BOOKS_SEARCH_URL}intitle:${encodeURIComponent(name)}`;
  if (author) {
    url += `+inauthor:${author}`;
  }

  const result = await fetch(url)
    .then((response: Response) => response.json())
    .then((json: GoogleBooksTypes.Response) => {
      if (json.items) {
        return json.items.filter((i: any) => i && i.volumeInfo)[0];
      }

      return undefined;
    });

  if (!result) {
    message.channel.send(
      `Could not find book \`${name}\` by \`${author ?? "any author"}\``
    );
    return;
  }

  await googleBooksFound(message, result);
}

export async function googleBooksFound(
  message: Message,
  book: GoogleBooksTypes.Book
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

  const info = book.volumeInfo!;

  const authorString = info.authors?.join(", ") ?? "Unknown authors";
  const descriptionNode = HTMLParser.parse(
    new HTMLParser.TextNode(
      book.searchInfo?.textSnippet ?? info.description ?? "No description"
    ).innerText
  );
  const descriptionString = descriptionNode.text;
  const goodreadsString = `[Open in Goodreads](${BOOKS_GOODREADS_SEARCH_URL}${info.industryIdentifiers[0].identifier})`;
  const description = `${descriptionString}\n\n${goodreadsString}`;

  const publisherString = `Published by ${
    info.publisher ?? "an unknown publisher"
  }`;
  const publishedDateString = `${
    (info.publishedDate ?? "-").includes("-") ? "on" : "in"
  } ${info.publishedDate ?? "an unknown date"}`;
  const pageCountString = `${
    info.pageCount === 0 ? "?" : info.pageCount
  } pages`;
  const information = `${publisherString} ${publishedDateString}\n${pageCountString}\n\n`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(info.title ?? "Unknown title")
    .setURL(info.infoLink ?? "https://www.google.com")
    .setDescription(authorString)
    .setImage(
      info.imageLinks
        ? info.imageLinks.large ?? info.imageLinks.thumbnail
        : "https://i.scdn.co/image/ab67616d0000b273d0fc337923634532f8319b10"
    )
    .addFields([
      {
        name: "Publishing Information",
        value: information,
      },
      {
        name: "Description",
        value: description,
      },
    ]);

  await message.channel.send({
    embeds: [embed],
  });
}
