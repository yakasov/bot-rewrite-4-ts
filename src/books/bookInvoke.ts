import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  BOOKS_SEARCH_URL,
  REGEX_GOOGLE_BOOKS_PATTERN,
} from "../consts/constants";

export async function googleBooksInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const promises: Promise<void>[] = [];
  const matches = [...message.content.matchAll(REGEX_GOOGLE_BOOKS_PATTERN)];
  for (const m of matches) {
    if (m[1].trim().length > 2) {
      promises.push(googleBooksSearch(message, m[1].trim()));
    }
  }

  await Promise.all(promises);
}

export async function googleBooksSearch(
  message: Message,
  query: string
): Promise<void> {
  const result = await fetch(
    `${BOOKS_SEARCH_URL}intitle:${encodeURIComponent(query)}`
  )
    .then((response: Response) => response.json())
    .then((json: any) => {
      if (json.items) {
        return json.items.filter(
          (i: any) =>
            i &&
            i.volumeInfo &&
            i.volumeInfo.description
        )[0];
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

  const info = book.volumeInfo;
  const description = `${info.authors.join(", ")}\n\n${
    book.searchInfo.textSnippet ?? info.description
  }`;
  const footer = `Published by ${info.publisher} in ${info.publishedDate}. ${info.pageCount} pages`;
  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(info.title)
    .setURL(info.infoLink)
    .setDescription(description)
    .setFooter({ text: footer })
    .setImage(info.imageLinks.thumbnail);

  await message.channel.send({
    embeds: [embed],
  });
}
