import { Message, AttachmentBuilder, EmbedBuilder } from "discord.js";
import type { PricingData } from "../types/scryfall/PricingData.d.ts";
import { getLowestHighestData, to2DP } from "./scryfallHelpers";
import { getImageUrl } from "./scryfallImageHelpers";
import { isSendableChannel } from "../util/typeGuards";
import moment from "moment-timezone";
import type { CardDetails, EmbedObject } from "../types/scryfall/Invoke.d.ts";
import {
  SCRYFALL_HEX_COLOR_CODES,
  SCRYFALL_SET_IMAGES_PATH,
} from "../consts/constants.js";
import {
  getCommanderRanks,
  getSetImage,
  getTotalCards,
} from "./scryfallCaching.js";

function getPercentileString(amount: number, total: number) {
  return `(top ${Math.min(100, (amount / total) * 100).toPrecision(3)}%)`;
}

export async function getCardMessageObject(
  message: Message,
  cardDetails: CardDetails,
  indexString = ""
): Promise<EmbedObject | undefined> {
  if (!isSendableChannel(message.channel) || !cardDetails.scry) return;

  const [isImageLocal, imageUrl]: [boolean, string] = await getImageUrl(
    cardDetails.scry
  );
  const cardImageAttachment: AttachmentBuilder | null = isImageLocal
    ? new AttachmentBuilder(`${imageUrl}.jpg`)
    : null;
  const releaseDate: moment.Moment = moment(cardDetails.scry.released_at);
  const unreleased: boolean = releaseDate.isAfter(moment.now());

  const legality: string =
    cardDetails.scry.legalities.commander === "legal" ? "Legal" : `Non-legal`;
  const rarity: string =
    cardDetails.scry.rarity.charAt(0).toUpperCase() +
    cardDetails.scry.rarity.slice(1);
  const edhrecRank: string = cardDetails.scry.edhrec_rank
    ? `\n\nEDHREC Rank #${
        cardDetails.scry.edhrec_rank
      } of ${await getTotalCards()} ${getPercentileString(
        cardDetails.scry.edhrec_rank,
        await getTotalCards()
      )}`
    : "";
  const commanderRanks: Record<string, number> = await getCommanderRanks();
  const commanderEdhrecRank: string = commanderRanks[cardDetails.scry.id]
    ? `\nCommander #${commanderRanks[cardDetails.scry.id]} of ${
        Object.keys(commanderRanks).length
      } ${getPercentileString(
        commanderRanks[cardDetails.scry.id],
        Object.keys(commanderRanks).length
      )}`
    : "";

  const setImageAttachment: AttachmentBuilder | null = await getSetImage(
    cardDetails.scry
  ).then((value: boolean) =>
    value
      ? new AttachmentBuilder(
          `${SCRYFALL_SET_IMAGES_PATH}/${cardDetails.scry?.id}.png`
        )
      : null
  );

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(cardDetails.scry.name)
    .setColor(SCRYFALL_HEX_COLOR_CODES[cardDetails.scry.border_color])
    .setURL(cardDetails.scry.scryfall_uri)
    .addFields(
      {
        name: "Type",
        value: `${cardDetails.scry.type_line}\n*${rarity}*`,
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
      name: `${cardDetails.scry.set_name} (${cardDetails.scry.set})`,
      iconURL: `attachment://${cardDetails.scry.id}.png`,
    });
  }

  if (cardDetails.scry.edhrec_rank) {
    embed.addFields({
      name: "Ranking",
      value: `${edhrecRank}${commanderEdhrecRank}`,
    });
  }

  const oracleId: string =
    cardDetails.scry.oracle_id ??
    cardDetails.scry.card_faces?.[0].oracle_id ??
    "";
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
        text:
          text +
          indexString +
          (cardDetails.edh
            ? `\nSalt ${cardDetails.edh.container.json_dict.card.salt.toFixed(
                3
              )}`
            : ""),
        ...(cardDetails.scry.game_changer
          ? { iconURL: "attachment://diamond.png" }
          : {}),
      });
    }
  } else {
    console.error(
      `Couldn't find an Oracle ID for card named ${cardDetails.scry.name}, ID ${cardDetails.scry.id}!`
    );
  }

  return {
    embeds: [embed],
    files: [
      ...(cardImageAttachment ? [cardImageAttachment] : []),
      ...(setImageAttachment ? [setImageAttachment] : []),
      ...(cardDetails.scry.game_changer
        ? [new AttachmentBuilder("./resources/scryfall/diamond.png")]
        : []),
    ],
  };
}
