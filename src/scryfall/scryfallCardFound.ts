import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";
import { handlePrintingChoice } from "./scryfallPrintHelpers";
import { Card } from "yakasov-scryfall-api";
import { getCardDetails } from "./scryfallHelpers";
import { SCRYFALL_PRINTINGS_SEARCH } from "../consts/constants";
import { getPrintList } from "./scryfallCaching";

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  set: string | undefined = undefined,
  number: number | undefined = undefined
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const cardDetails: Card | undefined = await getCardDetails(
    cardName,
    set,
    number
  );

  if (!cardDetails) {
    await message.channel.send(
      `Ran into an error fetching ${cardName} for set ${set} and number ${number}!`
    );
    return;
  }

  const printDetails: Card[] = cardDetails.oracle_id
    ? await getPrintList(cardDetails)
    : [];

  const currentIndex: number = printDetails
    .map((card: Card) => card.id)
    .indexOf(cardDetails.id);
  const cardObject = await getCardMessageObject(
    message,
    cardDetails,
    `   |   Printing ${currentIndex + 1} / ${printDetails.length}`
  );

  const cardFoundMessage: Message = await message.channel.send({
    components:
      printDetails.length > 1 ? [getActionButtonsRow(cardName).toJSON()] : [],
    ...cardObject,
  });

  if (printDetails.length === 1) return;

  await handlePrintingChoice(
    cardFoundMessage,
    message.author.id,
    printDetails,
    cardDetails
  );
}

export function getActionButtonsRow(cardName: string): ActionRowBuilder {
  const previousButton = new ButtonBuilder()
    .setCustomId("previous")
    .setLabel("< Previous")
    .setStyle(ButtonStyle.Primary);

  const middleButton = new ButtonBuilder()
    .setLabel("Printings")
    .setURL(
      SCRYFALL_PRINTINGS_SEARCH.replace(
        "<<REPLACE>>",
        encodeURIComponent(cardName)
      )
    )
    .setStyle(ButtonStyle.Link);

  const nextButton = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next >")
    .setStyle(ButtonStyle.Primary);

  return new ActionRowBuilder().addComponents(
    previousButton,
    middleButton,
    nextButton
  );
}
