import { PricingData } from "../types/scryfall/PricingData";
import { OracleResponse } from "../types/scryfall/OracleResponse";
import { Card, Prices } from "scryfall-api";
import { URL_SCRYFALL_ORACLE } from "../consts/constants";

const acceptedPrices = ["usd", "usd_foil", "eur", "eur_foil"];

export function convertPricesToGBP(prices: Prices): number[] {
  return Object.entries(prices)
      .filter(([key, value]) => acceptedPrices.includes(key) && value !== null)
      .map(
        ([key, value]) =>
          parseFloat(value!) * (key.includes("usd") ? 0.75 : 0.87)
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
    const convertedPrices = convertPricesToGBP(cardData.prices);
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
