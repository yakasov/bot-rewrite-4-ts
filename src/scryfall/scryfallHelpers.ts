import type { PricingData } from "../types/scryfall/PricingData.d.ts";
import type { OracleResponse } from "../types/scryfall/OracleResponse.d.ts";
import { Card, Cards, Prices } from "yakasov-scryfall-api";
import { URL_SCRYFALL_ORACLE } from "../consts/constants";

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

export async function getLowestHighestData(
  oracleId: string
): Promise<PricingData | undefined> {
  const oracleCards: Card[] = await fetch(
    URL_SCRYFALL_ORACLE.replace("<<ORACLE_ID>>", oracleId)
  )
    .then((response: Response) => response.json())
    .then((response: OracleResponse) => response.data)
    .catch((err: Error) => {
      console.warn(
        `Oracle fetch failed for ${URL_SCRYFALL_ORACLE.replace(
          "<<ORACLE_ID>>",
          oracleId
        )}, error message: ${err.message}`
      );
      return [];
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
  cardName: string,
  set: string | undefined = undefined,
  number: number | undefined = undefined
): Promise<Card | undefined> {
  const cardDetails: Card | undefined =
    set && number
      ? await Cards.bySet(set, number)
      : await Cards.byName(cardName, set, true);

  return cardDetails;
}
