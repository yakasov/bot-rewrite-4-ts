import { BOOKS_GOODREADS_SEARCH_URL } from "../consts/constants";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";

const badResponses = ["not found", "404 Not Found"];
let cachedResponses: {
  covers: { [key: string]: string | undefined };
  editions: { [key: string]: OpenLibraryTypes.Edition[] };
  goodreads: { [key: string]: string };
  works: { [key: string]: OpenLibraryTypes.Work };
} = {
  covers: {},
  editions: {},
  goodreads: {},
  works: {},
};

export async function getCoverById(
  key: string,
  coverKey: string,
  type: "id" | "olid"
): Promise<string | undefined> {
  if (!cachedResponses.covers[key]) {
    const coverInfo = await fetch(
      `https://covers.openlibrary.org/b/${type}/${coverKey}.json`
    ).then((response: Response) => response.text());
    if (!badResponses.includes(coverInfo)) {
      cachedResponses.covers[key] = coverInfo;
    }
  }

  return cachedResponses.covers[key];
}

export async function getEditions(
  key: string
): Promise<OpenLibraryTypes.Edition[]> {
  if (!cachedResponses.editions[key])
    cachedResponses.editions[key] = await fetch(
      `http://openlibrary.org${key}/editions.json`
    )
      .then((response: Response) => response.json())
      .then(
        (worksEditions: OpenLibraryTypes.WorksEditions) => worksEditions.entries
      );

  return cachedResponses.editions[key];
}

export async function getGoodreadsPage(isbn: string): Promise<string> {
  if (!cachedResponses.goodreads[isbn]) {
    cachedResponses.goodreads[isbn] = await fetch(
      BOOKS_GOODREADS_SEARCH_URL + isbn
    ).then((response: Response) => response.text());
  }

  return cachedResponses.goodreads[isbn];
}

export async function getWork(key: string): Promise<OpenLibraryTypes.Work> {
  if (!cachedResponses.works[key]) {
    cachedResponses.works[key] = await fetch(
      `https://openlibrary.org${key}.json`
    ).then((response: Response) => response.json());
  }

  return cachedResponses.works[key];
}
