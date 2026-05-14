import type { PricingData } from "../../types/scryfall/PricingData";
import type { OracleResponse } from "../../types/scryfall/OracleResponse";
import { Card, Cards, Prices } from "scryfall-api";
import {
  SCRYFALL_EDHREC_API_COMMANDER_SEARCH,
  SCRYFALL_EDHREC_API_SEARCH,
  URL_SCRYFALL_ORACLE,
} from "../../consts/constants.js";
import { EDHRecResponse } from "../../types/scryfall/EDHRecResponse";
import { encodeURIToBasic } from "../cardFound";
import { CardDetails } from "../../types/scryfall/Invoke";
import { getCommanderRanks, getSaltRanks } from "../caching";
import { Message } from "discord.js";
import { isSendableChannel } from "../../util/typeGuards";
import { getQuickCardMessageObject } from "../embedObjectBuilder";

const acceptedPrices: string[] = ["usd", "usd_foil", "eur", "eur_foil"];

export function to2DP(number: number): string {
  return (Math.round(number * 100) / 100).toFixed(2);
}

export function pricesToGBPArray(prices: Prices): number[] {
  return Object.entries(prices)
    .filter(([key, value]) => acceptedPrices.includes(key) && value !== null)
    .map(
      ([key, value]) => parseFloat(value) * (key.includes("usd") ? 0.75 : 0.87)
    );
}

export function getExactPrice(prices: Prices): string {
  const USDPriceString: string =
    prices.usd ?? prices.usd_foil ?? prices.usd_etched ?? "Infinity";
  const EURPriceString: string = prices.eur ?? prices.eur_foil ?? "Infinity";

  const USDPrice: number = parseFloat(USDPriceString) * 0.75;
  const EURPrice: number = parseFloat(EURPriceString) * 0.87;

  if (USDPrice === Infinity && EURPrice === Infinity) {
    return "???";
  }

  return Math.min(USDPrice, EURPrice).toFixed(2);
}

export async function getLowestHighestData(
  oracleId: string
): Promise<PricingData | undefined> {
  const oracleCards: Card[] = await fetch(
    URL_SCRYFALL_ORACLE.replace("<<ORACLE_ID>>", oracleId)
  )
    .then((response: Response) => response.json())
    .then((response: OracleResponse) => response.data)
    .catch((error) => {
      console.warn(
        `Oracle fetch failed for ${URL_SCRYFALL_ORACLE.replace(
          "<<ORACLE_ID>>",
          oracleId
        )}, error message: ${error}`
      );
      return Promise.resolve([]);
    });
  if (!oracleCards.length) {
    return undefined;
  }

  const lowestHighestData: PricingData = {
    highestPrice: -Infinity,
    highestSet: "",
    highestUrl: "",
    lowestPrice: Infinity,
    lowestSet: "",
    lowestUrl: "",
  };

  Object.values(oracleCards).forEach((cardData: Card) => {
    const convertedPrices = pricesToGBPArray(cardData.prices);
    const lowestPrice: number = Math.min(...convertedPrices) ?? Infinity;
    const highestPrice: number = Math.max(...convertedPrices) ?? -Infinity;

    if (lowestPrice < lowestHighestData.lowestPrice) {
      lowestHighestData.lowestPrice = lowestPrice;
      lowestHighestData.lowestSet = cardData.set;
      lowestHighestData.lowestUrl = cardData.scryfall_uri?.replace(
        "?utm_source=api",
        ""
      );
    }

    if (highestPrice > lowestHighestData.highestPrice) {
      lowestHighestData.highestPrice = highestPrice;
      lowestHighestData.highestSet = cardData.set;
      lowestHighestData.highestUrl = cardData.scryfall_uri?.replace(
        "?utm_source=api",
        ""
      );
    }
  });

  return lowestHighestData;
}

export async function getCardDetails(
  card: string | Card,
  set: string | undefined = undefined,
  number: number | undefined = undefined,
  passthroughEDH: EDHRecResponse | undefined = undefined,
  message: Message | undefined = undefined
): Promise<CardDetails> {
  let cardDetails: Card | undefined = undefined;
  if (typeof card === "string") {
    const cardDetailsPromise: Promise<Card | undefined> =
      set && number ? Cards.bySet(set, number) : Cards.byName(card, set, true);
    cardDetails = await cardDetailsPromise;
  } else {
    cardDetails = card;
  }

  let quickMessage: Message | undefined = undefined;
  if (message && cardDetails && isSendableChannel(message.channel)) {
    quickMessage = await message?.channel.send({ ...getQuickCardMessageObject(message, cardDetails)})
  }
  
  const isCommander: boolean =
    (await getCommanderRanks(message))[
      cardDetails?.oracle_id ?? cardDetails?.id ?? ""
    ] !== undefined;
  const edhRecPromise: Promise<EDHRecResponse | undefined> = passthroughEDH
    ? Promise.resolve(passthroughEDH)
    : getEDHRecDetails(cardDetails?.name ?? "", isCommander);
  const edhRecDetails: EDHRecResponse | undefined = await edhRecPromise;
  if (edhRecDetails) {
    edhRecDetails.saltRank = (await getSaltRanks())[
      cardDetails?.id ?? cardDetails?.oracle_id ?? ""
    ];
  }

  return { scry: cardDetails, edh: edhRecDetails, quickMessage };
}

export async function getEDHRecDetails(
  cardName: string,
  isCommander = false
): Promise<EDHRecResponse | undefined> {
  const EDHRecDetails: EDHRecResponse | undefined = await fetch(
    (isCommander
      ? SCRYFALL_EDHREC_API_COMMANDER_SEARCH
      : SCRYFALL_EDHREC_API_SEARCH
    ).replace("<<REPLACE>>", encodeURIToBasic(cardName))
  )
    .then((response: Response) => response.text())
    .then((response: string) =>
      response[0] !== "<" ? JSON.parse(response) : undefined
    )
    .catch((error) => {
      console.error("EDHREC Error:", error);
      return Promise.resolve(undefined);
    });

  return EDHRecDetails;
}

export function getCardName(card: Card): string {
  return card.printed_name ?? card.flavor_name ?? card.name;
}
