import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Card } from "yakasov-scryfall-api";
import type { PricingData } from "../types/scryfall/PricingData.d.ts";
import { getLowestHighestData, to2DP } from "./scryfallHelpers";
import { getImageUrl, getSetImage } from "./scryfallImageHelpers";
import { isSendableChannel } from "../util/typeGuards";
import moment from "moment-timezone";
import type { EmbedObject } from "../types/scryfall/Invoke.d.ts";
import { SCRYFALL_SET_IMAGES_PATH } from "../consts/constants.js";

export async function getCardMessageObject(
  message: Message,
  cardDetails: Card,
  indexString = ""
): Promise<EmbedObject | undefined> {
  if (!isSendableChannel(message.channel)) return;

  const [isImageLocal, imageUrl]: [boolean, string] = await getImageUrl(
    cardDetails
  );
  const cardImageAttachment: AttachmentBuilder | null = isImageLocal
    ? new AttachmentBuilder(`${imageUrl}.jpg`)
    : null;
  const releaseDate: moment.Moment = moment(cardDetails.released_at);
  const unreleased: boolean = releaseDate.isAfter(moment.now());

  const legality: string =
    cardDetails.legalities.commander === "legal" ? "Legal" : `Non-legal`;
  const rarity: string =
    cardDetails.rarity.charAt(0).toUpperCase() + cardDetails.rarity.slice(1);

  const setImageAttachment: AttachmentBuilder | null = await getSetImage(
    cardDetails
  ).then((value: boolean) =>
    value
      ? new AttachmentBuilder(
          `${SCRYFALL_SET_IMAGES_PATH}/${cardDetails.id}.png`
        )
      : null
  );

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(cardDetails.name)
    .setURL(cardDetails.scryfall_uri)
    .addFields(
      {
        name: "Type",
        value: `${cardDetails.type_line}\n*${rarity}*`,
        inline: true,
      },
      {
        name: "Legality",
        value: `${legality}${
          unreleased
            ? `\n*Releases on ${releaseDate.format("Do MMM YYYY")}*`
            : ""
        }`,
        inline: true,
      }
    );

  if (imageUrl) {
    // EmbedBuilder.setImage actually checks that this is a valid URI!!!
    embed.setImage(
      isImageLocal ? `attachment://${imageUrl.split("/").pop()}.jpg` : imageUrl
    );
  }

  if (setImageAttachment) {
    embed.setAuthor({
      name: `${cardDetails.set_name} (${cardDetails.set})`,
      iconURL: `attachment://${cardDetails.id}.png`,
    });
  }

  if (cardDetails.game_changer) {
    embed.setThumbnail("attachment://diamond.png");
  }

  const oracleId: string =
    cardDetails.oracle_id ?? cardDetails.card_faces?.[0].oracle_id ?? "";
  if (oracleId.length) {
    const lowestHighestData: PricingData | undefined =
      await getLowestHighestData(oracleId);

    if (lowestHighestData) {
      const text: string =
        lowestHighestData.lowestPrice !== Infinity &&
        lowestHighestData.highestPrice !== -Infinity
          ? `£${to2DP(lowestHighestData.lowestPrice)} (${
              lowestHighestData.lowestSet
            }) - £${to2DP(lowestHighestData.highestPrice)} (${
              lowestHighestData.highestSet
            })`
          : "No pricing data found!";
      embed.setFooter({
        text: text + indexString,
      });
    }
  } else {
    console.error(
      `Couldn't find an Oracle ID for card named ${cardDetails.name}, ID ${cardDetails.id}!`
    );
  }

  return {
    embeds: [embed],
    files: [
      ...(cardImageAttachment ? [cardImageAttachment] : []),
      ...(setImageAttachment ? [setImageAttachment] : []),
      ...(cardDetails.game_changer
        ? [new AttachmentBuilder("./resources/scryfall/diamond.png")]
        : []),
    ],
  };
}
