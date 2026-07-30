import fs from "fs";
import { Cards, type Card } from "scryfall-api";
import type { OracleResponse } from "../types/scryfall/OracleResponse";
import type { SetResponse } from "../types/scryfall/SetResponse";
import sharp, { Sharp } from "sharp";
import {
  SCRYFALL_DEFAULT_COMMANDER_LEGAL_QUERY,
  SCRYFALL_DEFAULT_COMMANDER_QUERY,
  SCRYFALL_DEFAULT_QUERY,
  SCRYFALL_SET_IMAGES_PATH,
} from "../consts/constants";
import { Message } from "discord.js";
import { DATABASE_KEYS_PRESENT } from "../keys";

const printCache: Record<string, Card[]> = {};
const setImageCache: string[] = [];
const commanderRanks: Record<string, number> = {};
let saltRanks: Record<string, number> | null = null;
let commanderCards = 0;
let totalLegalCards = 0;
let totalCards = 0;
let rebuildingCache = false;

/**
 * Adds Accept and User-Agent headers for use with the Scryfall API
 * 
 * @param url 
 * @returns a fetch with the correct headers
 */
export const fetchWithHeader = (url: string): Promise<Response> =>
  fetch(url, {
    headers: {
      Accept: "*/*",
      "User-Agent": "Scryfall-TS",
    },
  });

  /**
   * Fetches the full print list of a given card. If this card has already been fetched, it will use a local cache instead.
   * 
   * @param card 
   * @returns an array of printings represented by Card
   */
export async function getPrintList(card: Card): Promise<Card[]> {
  if (!card.oracle_id) return [];

  if (!printCache[card.oracle_id]) {
    printCache[card.oracle_id] = await fetchWithHeader(card.prints_search_uri)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.data);
  }

  return printCache[card.oracle_id];
}

/**
 * Fetches the set icon of a given card. If this icon has already been fetched, it will use a local cache instead.
 * The set icon is given in SVG, so it is converted to a PNG for caching.
 * 
 * @param card 
 * @returns whether the SVG was converted and cached successfully (or, whether it exists in the cache)
 */
export async function getSetImage(card: Card): Promise<boolean> {
  if (setImageCache.length === 0) {
    fs.readdir(
      SCRYFALL_SET_IMAGES_PATH,
      (_: NodeJS.ErrnoException | null, files: string[]) => {
        if (files) {
          files.map((file: string) => setImageCache.push(file));
        }
      }
    );
  }

  if (setImageCache.includes(card.id)) return true;

  const setInfo: SetResponse = await fetchWithHeader(
    card.set_uri
  ).then((response: Response) => response.json());
  const setSvgBuffer: ArrayBuffer | null = await fetchWithHeader(
    setInfo.icon_svg_uri
  )
    .then((response: Response) => response.arrayBuffer())
    .catch((error) => {
      console.error("getSetImage Error (setSvgBuffer)", error);
      return Promise.resolve(null);
    });

  if (!setSvgBuffer) return false;

  const setIconPng: Sharp = sharp(setSvgBuffer, { density: 300 }).negate({
    alpha: false,
  });
  const hasSaved: boolean = await setIconPng
    .toFile(`${SCRYFALL_SET_IMAGES_PATH}/${card.id}.png`)
    .then(() => {
      setImageCache.push(card.id);
      return true;
    })
    .catch((error) => {
      console.error("getSetImage Error (hasSaved)", error);
      return Promise.resolve(false);
    });

  setImageCache.push(card.id);

  return hasSaved;
}

/**
 * Gets the pre-saved salt listings for each card. This is computed once a year manually.
 * 
 * @returns a record of Oracle ID: salt value
 */
export async function getSaltRanks(): Promise<Record<string, number>> {
  if (!saltRanks) {
    saltRanks = JSON.parse(
      fs.readFileSync("./resources/scryfall/salt.json", {
        encoding: "utf8",
        flag: "r",
      })
    );
  }

  return saltRanks ?? {};
}

/**
 * Fetches the relative rankings of each commander card. If the rankings have already been fetched, it will use a local cache instead.
 * 
 * @param message 
 * @returns a record of Oracle ID: commander rank
 */
export async function getCommanderRanks(
  message?: Message
): Promise<Record<string, number>> {
  // Skip commander cache if no database is present (since it's probably a local build)
  if (Object.keys(commanderRanks).length === 0 && DATABASE_KEYS_PRESENT) {
    const cachedLength: number = await readWriteCommanderCache();

    if ((await getTotalCommanderCards()) !== cachedLength && !rebuildingCache) {
      rebuildCommanderCache(message);
    }
  }

  return commanderRanks;
}

/**
 * Rebuilds the commander cache via Scryfall commander syntax if the previous one is outdated.
 * This occurs if the amount of commanders has changed.
 * 
 * @param message 
 */
async function rebuildCommanderCache(message?: Message): Promise<void> {
  rebuildingCache = true;

  message?.reply("No / expired commander cache found! Generating one now...");
  const commandersArray: Card[] = [];
  let currentPage = 1;

  while (true) {
    const queryResult: Card[] = await Cards.search(
      "legal:commander is:commander order:edhrec",
      {
        page: currentPage,
      }
    ).get(175);
    commandersArray.push(...queryResult);

    if (queryResult.length !== 175) break;

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Fetched ${commandersArray.length} commanders...`);

    currentPage++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  for (const [index, card] of commandersArray.entries()) {
    commanderRanks[card.oracle_id ?? card.id] = index + 1;
  }

  await readWriteCommanderCache();
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(
    `Commander cache created! Total commanders: ${commandersArray.length}\n`
  );

  rebuildingCache = false;
}

/**
 * Handles read/write operations to the commander JSON cache.
 * 
 * @returns the amount of commanders in the cache.
 */
export async function readWriteCommanderCache(): Promise<number> {
  if (Object.keys(commanderRanks).length === 0) {
    let cachedCommanderData: {
      data: Record<string, number>;
      length: number;
    } = { data: {}, length: 0 };
    try {
      cachedCommanderData = JSON.parse(
        fs.readFileSync("./resources/scryfall/commanders.json", {
          encoding: "utf8",
          flag: "r",
        })
      );
    } catch {
      console.warn("No previous commanders.json exists!");
    }
    return cachedCommanderData.length;
  } else {
    fs.writeFileSync(
      "./resources/scryfall/commanders.json",
      JSON.stringify({ data: commanderRanks, length: commanderRanks.length })
    );
    return commanderRanks.length;
  }
}

/**
 * Fetches an up-to-date amount of commanders via Scryfall.
 * 
 * @returns the amount of commanders in play.
 */
export async function getTotalCommanderCards(): Promise<number> {
  if (commanderCards === 0) {
    commanderCards = await fetchWithHeader(SCRYFALL_DEFAULT_COMMANDER_QUERY)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.total_cards)
      .catch((error) => {
        console.error(error);
        return Promise.resolve(1);
      });
  }

  return commanderCards;
}

/**
 * Fetches the amount of legal cards available in the Commander format.
 * 
 * @returns the amount of legal cards.
 */
export async function getTotalLegalCards(): Promise<number> {
  if (totalLegalCards === 0) {
    totalLegalCards = await fetchWithHeader(SCRYFALL_DEFAULT_QUERY)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.total_cards)
      .catch((error) => {
        console.error(error);
        return Promise.resolve(1);
      });
  }

  return totalLegalCards;
}

/**
 * Fetches the amount of legal commanders available in the Commander format.
 * 
 * @returns the amount of legal commanders.
 */
export async function getTotalCards(): Promise<number> {
  if (totalCards === 0) {
    totalCards = await fetchWithHeader(SCRYFALL_DEFAULT_COMMANDER_LEGAL_QUERY)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.total_cards)
      .catch((error) => {
        console.error(error);
        return Promise.resolve(1);
      });
  }

  return totalCards;
}
