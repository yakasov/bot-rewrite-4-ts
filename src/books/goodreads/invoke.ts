import HTMLParser, { HTMLElement } from "node-html-parser";
import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../../util/typeGuards";
import {
  BOOKS_GOODREADS_SEARCH_URL,
  REGEX_BOOKS_PATTERN,
  REGEX_GOODREADS_IMAGE_PATTERN,
} from "../../consts/constants";
import { encodeURIToBasic } from "../../scryfall/cardFound";

interface GoodreadsAttributes {
  url: string;
  name: string;
  author: string;
  imageURL: string;
  description: string;
  genres: string;
  footer: string;
}

export async function goodreadsInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_BOOKS_PATTERN.exec(message.content)) !== null) {
    const bookName: string | undefined = match.groups?.name.trim();
    const bookAuthor: string | undefined = match.groups?.author?.trim();

    if (!bookName) continue;

    promises.push(goodreadsSearch(message, bookName, bookAuthor));
  }

  await Promise.all(promises);
}

export async function goodreadsSearch(
  message: Message,
  input: string,
  author: string | undefined
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const replyMessage: Message = await message.reply(
    `Fetching \`${input}, ${author ?? "any author"}\`...`
  );

  const url = `${BOOKS_GOODREADS_SEARCH_URL}${encodeURIToBasic(
    input
  )}${encodeURIToBasic(author ?? "")}`;
  const resultsText: string = await fetch(url).then((response: Response) =>
    response.text()
  );

  const parsedHTML: HTMLElement = HTMLParser(resultsText);
  const bookItems: HTMLElement[] = parsedHTML.querySelectorAll(
    "tr[itemtype='http://schema.org/Book']"
  );

  const bookElement: HTMLElement =
    bookItems.find((e) => {
      const name: string =
        e.children[1]
          .querySelector("span[itemprop='name']")
          ?.innerText.toLocaleLowerCase() ?? "";
      const inputName = input.toLocaleLowerCase();
      return (
        name === inputName ||
        name?.includes(inputName) ||
        inputName.includes(name)
      );
    }) ?? bookItems[0];
  if (!bookElement || !bookElement.children) {
    await replyMessage.edit(
      `Could not find any results for ${input}, ${author ?? "any author"}`
    );
    return;
  }
  const bookInfo: HTMLElement = bookElement.children[1];

  if (bookInfo) {
    const bookURLInfo: HTMLElement | null =
      bookInfo.querySelector("a[itemprop='url']");
    const bookURL = `https://www.goodreads.com${bookURLInfo?.attributes["href"]}`;
    const parsedPage: HTMLElement = HTMLParser(
      await fetch(bookURL).then((response: Response) => response.text())
    );

    const nameElements: HTMLElement[] = bookInfo.querySelectorAll(
      "span[itemprop='name']"
    );

    const compressedImageURL: string =
      bookElement.querySelector("img[itemprop='image']")?.attributes["src"] ??
      "";
    const imageURLMatch: RegExpMatchArray | null = compressedImageURL.match(
      REGEX_GOODREADS_IMAGE_PATTERN
    );
    const imageURL: string = imageURLMatch
      ? `https://images-na.ssl-images-amazon.com/${imageURLMatch[0]}.jpg`
      : compressedImageURL;

    const description = `${parsedPage
      .querySelectorAll(".DetailsLayoutRightParagraph__widthConstrained")
      ?.find((element) => element.children[0]?.classNames.includes("Formatted"))
      ?.innerText?.slice(0, 768)}...`;

    const genres: string = parsedPage
      .querySelectorAll("span[class='BookPageMetadataSection__genreButton']")
      .map((e) => e.innerText)
      .join(", ");

    const footer: string =
      parsedPage
        .querySelector("div[class='FeaturedDetails']")
        ?.children.map((e) => e.innerText)
        .join("\n") ?? "";

    await goodreadsBookFound(replyMessage, {
      url: bookURL,
      name: nameElements[0].innerText,
      author: nameElements[1].innerText,
      imageURL,
      description,
      genres,
      footer,
    });
  }
}

export async function goodreadsBookFound(
  replyMessage: Message,
  {
    url,
    name,
    author,
    imageURL,
    description,
    genres,
    footer,
  }: GoodreadsAttributes
): Promise<void> {
  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(name)
    .setURL(url)
    .setDescription(author)
    .setImage(imageURL)
    .setFooter({ text: footer })
    .addFields(
      {
        name: "Description",
        value: description,
      },
      {
        name: "Genres",
        value: genres,
      }
    );

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}
