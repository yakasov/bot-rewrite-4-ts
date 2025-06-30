import { Card } from "scryfall-api";
import { PricingData } from "../types/scryfall/PricingData";
import { OracleResponse } from "../types/scryfall/OracleResponse";

export async function getLowestHighestData(
  oracleId: string
): Promise<PricingData> {
  const oracleData: OracleResponse = await fetch(
    `https://api.scryfall.com/cards/search?order=released&q=oracleid%3A${oracleId}&unique=prints`
  )
    .then((response) => response.json())
    .then((response) => response.data);
  const lowestHighestData: PricingData = {
    highestPrice: 0,
    highestSet: "",
    highestUrl: "",
    lowestPrice: 10000,
    lowestSet: "",
    lowestUrl: "",
  };
  Object.values(oracleData.data).forEach((cardData) => {
    const lowestPrice: number = Math.min(
      parseFloat(cardData.prices.usd ?? "10000"),
      parseFloat(cardData.prices.usd_foil ?? "10000")
    );
    const highestPrice: number = Math.max(
      parseFloat(cardData.prices.usd ?? "0"),
      parseFloat(cardData.prices.usd_foil ?? "0")
    );
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

export async function getImageUrl(
  cardDetails: Card
): Promise<[boolean, string]> {
  if (
    cardDetails.card_faces?.length === 2 &&
    cardDetails.card_faces[0].image_uris
  ) {
    return [true, await combineImages(cardDetails)];
  }

  return [false, cardDetails.image_uris?.large ?? ""];
}
