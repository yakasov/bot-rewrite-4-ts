import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Card, Cards, Prices } from "scryfall-api";
import { PricingData } from "../types/scryfall/PricingData";
import { convertPricesToGBP, getLowestHighestData } from "./scryfallHelpers";
import { getImageUrl } from "./scryfallImageHelpers";
import { isSendableChannel } from "../util/typeGuards";

export function pricesToGBP(prices: Prices): string {
  if (!(prices.usd || prices.usd_foil || prices.eur || prices.eur_foil)) {
    return "???";
  }

  const conversionRate: number = prices.usd || prices.usd_foil ? 0.75 : 0.86;
  const price: string =
    prices.usd ?? prices.usd_foil ?? prices.eur ?? prices.eur_foil ?? "0";

  const GBPPrice = parseFloat(price!) * conversionRate;
  return GBPPrice > 100 ? GBPPrice.toString() : to2DP(GBPPrice);
}

export function to2DP(number: number): string {
  return (Math.round(number * 100) / 100).toFixed(2);
}

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  set: string | undefined,
  number: number | undefined = undefined
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const cardDetails: Card | undefined = number
    ? await Cards.bySet(set!, number)
    : await Cards.byName(cardName, set, false);

  if (!cardDetails) {
    await message.channel.send(
      `Ran into an error fetching ${cardName} for set ${set} and number ${number}!`
    );
    return;
  }

  const [isImageLocal, imageUrl]: [boolean, string] = await getImageUrl(
    cardDetails
  );
  const attachment: AttachmentBuilder | null = isImageLocal
    ? new AttachmentBuilder(`${imageUrl}.jpg`)
    : null;
  const foilOnly: boolean =
    cardDetails.prices.usd === null && cardDetails.prices.usd_foil !== null;
  const footer: string = `${
    cardDetails.legalities.commander === "legal" ? "Legal" : "Non-legal"
  } // £${to2DP(Math.min(...convertPricesToGBP(cardDetails.prices)))}${
    foilOnly ? " (F)" : ""
  } // ${
    cardDetails.rarity.charAt(0).toUpperCase() + cardDetails.rarity.slice(1)
  }\n${cardDetails.set_name} (${cardDetails.set})`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(cardDetails.name)
    .setURL(cardDetails.scryfall_uri)
    .setFooter({ text: footer });

  if (imageUrl) {
    // EmbedBuilder.setImage actually checks that this is a valid URI!!!
    embed.setImage(
      isImageLocal ? `attachment://${imageUrl.split("/").pop()}.jpg` : imageUrl
    );
  }

  const oracleId: string =
    cardDetails.oracle_id ?? cardDetails.card_faces?.[0].oracle_id ?? "";
  if (oracleId.length) {
    const lowestHighestData: PricingData | undefined =
      await getLowestHighestData(oracleId);

    if (lowestHighestData) {
      embed.addFields({
        name: "Prices",
        value: `
Lowest: [${lowestHighestData.lowestSet} @ \
£${to2DP(lowestHighestData.lowestPrice)}](${lowestHighestData.lowestUrl})
Highest: [${lowestHighestData.highestSet} @ \
£${to2DP(lowestHighestData.highestPrice)}](${lowestHighestData.highestUrl})
`,
      });
    }
  } else {
    console.error(
      `Couldn't find an Oracle ID for card named ${cardDetails.name}, ID ${cardDetails.id}!`
    );
  }

  await message.channel.send({
    content: cardDetails.scryfall_uri.replace("?utm_source=api", ""),
    embeds: [embed],
    files: attachment ? [attachment] : [],
  });
}
