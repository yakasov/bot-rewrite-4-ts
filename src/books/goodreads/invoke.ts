import HTMLParser, { HTMLElement } from "node-html-parser";
import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../../util/typeGuards";
import {
  BOOKS_GOODREADS_SEARCH_URL,
  REGEX_BOOKS_PATTERN,
  REGEX_GOODREADS_DATA_PATTERN,
  REGEX_GOODREADS_IMAGE_PATTERN,
} from "../../consts/constants";
import { encodeURIToBasic } from "../../scryfall/cardFound";
import moment from "moment-timezone";
import {
  ApolloState,
  BookHeader,
  NextData,
} from "../../types/books/GoodreadsNextData";

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
    const pageText: string = await fetch(bookURL).then((response: Response) =>
      response.text()
    );

    let bookHeader: BookHeader;
    const match = pageText.match(REGEX_GOODREADS_DATA_PATTERN);
    if (match) {
      try {
        const jsonData: NextData = JSON.parse(
          match[0]
            .replace('<script id="__NEXT_DATA__" type="application/json">', "")
            .replace("</script>", "")
        );
        // This filter sucks!!!
        const bookKey: `Book:${string}` = Object.keys(
          jsonData.props.pageProps.apolloState
        ).filter(
          (k) =>
            k.startsWith("Book") &&
            (jsonData.props.pageProps.apolloState as ApolloState)[
              k as `Book:${string}`
            ].bookGenres
        )[0] as `Book:${string}`;
        bookHeader = jsonData.props.pageProps.apolloState[bookKey];
      } catch (error) {
        await replyMessage.edit(
          `Failed to parse JSON for ${bookURL}: \`\`\`\n${error}\`\`\``
        );
        return;
      }
    } else {
      await replyMessage.edit(`Couldn't find __NEXT_DATA__, oops!`);
      return;
    }

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

    const description =
      bookHeader['description({"stripped":true})'].slice(0, 768) + "...";
    const genres: string = bookHeader.bookGenres
      .map((g) => g.genre.name)
      .join(", ");
    const footer = `${bookHeader.details.numPages} pages, ${
      bookHeader.details.format
    }\nFirst published ${moment(bookHeader.details.publicationTime).format(
      "LL"
    )}`;

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

  if (footer.length > 0) {
    embed.setFooter({ text: footer });
  }

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}
