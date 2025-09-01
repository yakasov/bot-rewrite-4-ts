import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Card, Cards } from "scryfall-api";
import { PricingData } from "../types/scryfall/PricingData";
import { getLowestHighestData, to2DP } from "./scryfallHelpers";
import { getImageUrl } from "./scryfallImageHelpers";
import { isSendableChannel } from "../util/typeGuards";
import moment from "moment-timezone";

export async function getCardMessageObject(
  message: Message,
  cardName: string,
  set: string | undefined = undefined,
  number: number | undefined = undefined
): Promise<any> {
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
  const releaseDate = moment(cardDetails.released_at);
  const unreleased: boolean = releaseDate.isAfter(moment.now());

  const legality: string =
    cardDetails.legalities.commander === "legal"
      ? "Legal"
      : `Non-legal${unreleased ? "*" : ""}`;
  const rarity: string =
    cardDetails.rarity.charAt(0).toUpperCase() + cardDetails.rarity.slice(1);

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(cardDetails.name)
    .setURL(cardDetails.scryfall_uri)
    .setDescription(`${cardDetails.set_name} (${cardDetails.set})\n*${rarity}*`)
    .addFields({
      name: "Legality",
      value: `${legality}${
        unreleased
          ? `\n\n*Releases on ${releaseDate.format("Do MMM YYYY")}`
          : ""
      }`,
    });

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
      embed.setFooter({
        text:
          lowestHighestData.lowestPrice !== Infinity &&
          lowestHighestData.highestPrice !== -Infinity
            ? `£${to2DP(lowestHighestData.lowestPrice)} (${
                lowestHighestData.lowestSet
              }) - £${to2DP(lowestHighestData.highestPrice)} (${
                lowestHighestData.highestSet
              })
`
            : "No pricing data found!",
      });
    }
  } else {
    console.error(
      `Couldn't find an Oracle ID for card named ${cardDetails.name}, ID ${cardDetails.id}!`
    );
  }

  return {
    embeds: [embed],
    files: attachment ? [attachment] : [],
  };
}
