import fs from "fs";
import { Cards, type Card } from "yakasov-scryfall-api";
import type { OracleResponse } from "../types/scryfall/OracleResponse";
import type { SetResponse } from "../types/scryfall/SetResponse";
import sharp, { Sharp } from "sharp";
import {
  SCRYFALL_DEFAULT_COMMANDER_QUERY,
  SCRYFALL_DEFAULT_QUERY,
  SCRYFALL_SET_IMAGES_PATH,
} from "../consts/constants";

const printCache: Record<string, Card[]> = {};
const setImageCache: string[] = [];
const commanderRanks: Record<string, number> = {};
let commanderCards = 0;
let totalCards = 0;

export async function getPrintList(card: Card): Promise<Card[]> {
  if (!card.oracle_id) return [];

  if (!printCache[card.oracle_id]) {
    printCache[card.oracle_id] = await fetch(card.prints_search_uri)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.data);
  }

  return printCache[card.oracle_id];
}

export async function getSetImage(cardDetails: Card): Promise<boolean> {
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

  if (setImageCache.includes(cardDetails.id)) return true;

  const setInfo: SetResponse = await fetch(cardDetails.set_uri).then(
    (response: Response) => response.json()
  );
  const setSvgBuffer: ArrayBuffer = await fetch(setInfo.icon_svg_uri).then(
    (response: Response) => response.arrayBuffer()
  );
  const setIconPng: Sharp = sharp(setSvgBuffer, { density: 300 }).negate({
    alpha: false,
  });
  const hasSaved: boolean = await setIconPng
    .toFile(`${SCRYFALL_SET_IMAGES_PATH}/${cardDetails.id}.png`)
    .then(() => {
      setImageCache.push(cardDetails.id);
      return true;
    })
    .catch((err: unknown) => {
      console.error(err);
      return false;
    });

  setImageCache.push(cardDetails.id);

  return hasSaved;
}

export async function getCommanderRanks(): Promise<Record<string, number>> {
  if (Object.keys(commanderRanks).length === 0) {
    const cachedLength: number = await readWriteCommanderCache();

    if ((await getTotalCommanderCards()) !== cachedLength) {
      const commandersArray: Card[] = await Cards.search(
        "legal:commander is:commander order:edhrec"
      ).get(3000);
      for (const [index, card] of commandersArray.entries()) {
        commanderRanks[card.id] = index + 1;
      }

      await readWriteCommanderCache();
    }
  }

  return commanderRanks;
}

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
    } catch (err: unknown) {
      console.error(err);
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

export async function getTotalCommanderCards(): Promise<number> {
  if (commanderCards === 0) {
    commanderCards = await fetch(SCRYFALL_DEFAULT_COMMANDER_QUERY)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.total_cards);
  }

  return commanderCards;
}

export async function getTotalCards(): Promise<number> {
  if (totalCards === 0) {
    totalCards = await fetch(SCRYFALL_DEFAULT_QUERY)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.total_cards);
  }

  return totalCards;
}
