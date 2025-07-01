import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Card, Cards } from "scryfall-api";
import { PricingData } from "../types/scryfall/PricingData";
import { getLowestHighestData } from "./scryfallHelpers";
import { getImageUrl } from "./scryfallImageHelpers";

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  set: string | undefined
): Promise<void> {
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const cardDetails: Card | undefined = await Cards.byName(
    cardName,
    set,
    false
  );

  if (!cardDetails) {
    message.channel.send(
      `Ran into an error fetching ${cardName} for set ${set}!`
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
  } // $${cardDetails.prices.usd ?? cardDetails.prices.usd_foil ?? "???"}${
    foilOnly ? " (F)" : ""
  } // ${
    cardDetails.rarity.charAt(0).toUpperCase() + cardDetails.rarity.slice(1)
  }`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(cardDetails.name)
    .setURL(cardDetails.scryfall_uri)
    .setFooter({ text: footer })
    .setImage(
      isImageLocal ? `attachment://${imageUrl.split("/").pop()}.jpg` : imageUrl
    );

  const oracleId: string =
    cardDetails.oracle_id ?? cardDetails.card_faces?.[0].oracle_id ?? "";
  if (oracleId.length) {
    const lowestHighestData: PricingData = await getLowestHighestData(oracleId);
    embed.addFields({
      name: "Prices",
      value: `
Lowest: [${lowestHighestData.lowestSet} @\
$${lowestHighestData.lowestPrice}](${lowestHighestData.lowestUrl})
Highest: [${lowestHighestData.highestSet} @\
$${lowestHighestData.highestPrice}](${lowestHighestData.highestUrl})
`,
    });
  } else {
    console.error(
      `Couldn't find an Oracle ID for card named ${cardDetails.name}, ID ${cardDetails.id}!`
    );
  }

  message.channel.send({
    content: cardDetails.scryfall_uri.replace("?utm_source=api", ""),
    embeds: [embed],
    files: attachment ? [attachment] : [],
  });
}
