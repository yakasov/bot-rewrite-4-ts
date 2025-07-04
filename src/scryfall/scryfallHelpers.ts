import { PricingData } from "../types/scryfall/PricingData";
import { OracleResponse } from "../types/scryfall/OracleResponse";
import { Card } from "scryfall-api";
import { URL_SCRYFALL_ORACLE } from "../consts/constants";

export async function getLowestHighestData(
  oracleId: string
): Promise<PricingData> {
  const oracleCards: Card[] = await fetch(
    URL_SCRYFALL_ORACLE.replace("<<ORACLE_ID>>", oracleId)
  )
    .then((response: Response) => response.json())
    .then((response: OracleResponse) => response.data);
  const lowestHighestData: PricingData = {
    highestPrice: 0,
    highestSet: "",
    highestUrl: "",
    lowestPrice: 10000,
    lowestSet: "",
    lowestUrl: "",
  };
  Object.values(oracleCards).forEach((cardData) => {
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
