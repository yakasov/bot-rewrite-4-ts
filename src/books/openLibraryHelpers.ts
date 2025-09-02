import HTMLParser, { HTMLElement } from "node-html-parser";
import {
  BOOKS_DESCRIPTION_ERROR,
  BOOKS_INVALID_IMAGE_URL,
} from "../consts/constants";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";
import {
  getCoverById,
  getEditions,
  getGoodreadsPage,
} from "./openLibraryFetchers";
import moment from "moment-timezone";

export async function getISBN(
  book: OpenLibraryTypes.Book
): Promise<string | undefined> {
  const sourceISBN: string | undefined = book.ia
    ?.find((i) => i.startsWith("isbn_"))
    ?.replace("isbn_", "");

  if (sourceISBN) {
    return sourceISBN;
  } else if (book.edition_count === 1) {
    // If a book has no ISBN and only one edition, it might be a fault of OpenLibrary
    return undefined;
  }

  // If we have multiple editions, we need to find the best fit edition
  // Usually this will be the *first* edition
  const editions: OpenLibraryTypes.Edition[] = await getEditions(book.key);
  const sortedEditions = editions.sort((a, b) =>
    moment(a.publish_date).utc().diff(moment(b.publish_date).utc())
  );
  const recentEdition: OpenLibraryTypes.Edition | undefined = sortedEditions
    .filter(
      (edition) =>
        edition.publish_date &&
        edition.languages?.some((language) => language.key === "/languages/eng")
    )
    ?.pop();
  const editionISBN: string | undefined =
    recentEdition?.isbn_10?.[0] ?? recentEdition?.isbn_13?.[0];

  return editionISBN;
}

export async function getSourceImage(
  book: OpenLibraryTypes.Book
): Promise<string> {
  /*
   * Goodreads probably has the best image available
   * and it's unlikely OpenLibrary will have an image when
   * Goodreads doesn't. Even so, best to check
   *
   * Goodreads will fail to get an image if the book doesn't have
   * an ISBN attached
   */
  const goodreadsImage = await getGoodreadsImage(book);
  if (goodreadsImage) {
    return goodreadsImage;
  }

  // Uses the Covers API directly to see if any covers are available for the default edition
  const coverInfoByOlid: string | undefined = await getCoverById(
    book.key,
    book.cover_edition_key,
    "olid"
  );
  if (coverInfoByOlid) {
    return await getBestFitCover(coverInfoByOlid);
  }

  // If we don't immediately have a cover from the first query, check the editions
  const bestFitEdition: OpenLibraryTypes.Edition | undefined = (
    await getEditions(book.key)
  ).find((edition: OpenLibraryTypes.Edition) => edition.ocaid === book.ia?.[0]);
  if (bestFitEdition?.covers?.length! > 0) {
    const coverInfoById: string | undefined = await getCoverById(
      book.key,
      bestFitEdition!.covers[0].toString(),
      "id"
    );
    if (coverInfoById) {
      return await getBestFitCover(coverInfoById);
    }
  }

  // If Goodreads doesn't have an image, and OpenLibrary
  // also doesn't have an image... it probably doesn't exist
  return BOOKS_INVALID_IMAGE_URL;
}

async function getBestFitCover(coverInfo: string) {
  const parsedCoverInfo: OpenLibraryTypes.Cover = JSON.parse(coverInfo);
  const largestImageSize: string = parsedCoverInfo.filename_l
    ? "L"
    : parsedCoverInfo.filename_m
    ? "M"
    : "S";
  return parsedCoverInfo.source_url !== ""
    ? parsedCoverInfo.source_url
    : `https://covers.openlibrary.org/b/olid/${parsedCoverInfo.olid}-${largestImageSize}.jpg`;
}

async function getGoodreadsImage(
  book: OpenLibraryTypes.Book
): Promise<string | undefined> {
  const isbn: string | undefined = await getISBN(book);

  if (!isbn) {
    return undefined;
  }

  const parsedHTML: HTMLElement = HTMLParser(await getGoodreadsPage(isbn));
  const imageUrl: string | undefined =
    parsedHTML.querySelectorAll(".ResponsiveImage")?.[0].attributes?.["src"];

  return imageUrl;
}

export async function getSourceDescription(
  book: OpenLibraryTypes.Book,
  work: OpenLibraryTypes.Work
): Promise<string> {
  const isbn: string | undefined = await getISBN(book);

  if (!isbn) {
    return getDescription(work.description);
  }

  const parsedHTML: HTMLElement = HTMLParser(await getGoodreadsPage(isbn));
  const description: string | undefined = parsedHTML
    .querySelectorAll(".DetailsLayoutRightParagraph__widthConstrained")
    ?.find((element) =>
      element.children[0]?.classNames.includes("Formatted")
    )?.innerText;

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
    typeof description === "string"
      ? description
      : description?.value ?? BOOKS_DESCRIPTION_ERROR;
  return shortenDescription(descriptionString);
}
