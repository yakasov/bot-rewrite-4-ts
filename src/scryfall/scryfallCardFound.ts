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
import {
  REGEX_SCRYFALL_EDHREC_PATTERN,
  SCRYFALL_EDHREC_SEARCH,
  SCRYFALL_PRINTINGS_SEARCH,
  SCRYFALL_SPELLBOOK_URL,
} from "../consts/constants";
import { getPrintList } from "./scryfallCaching";
import { CardDetails, EmbedObject, Modifiers } from "../types/scryfall/Invoke";

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  modifiers: Modifiers
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const cardDetails: CardDetails = await getCardDetails(
    cardName,
    modifiers.isSpecificSet,
    modifiers.isSpecificNumber
  );

  if (!cardDetails.scry) {
    await message.channel.send(
      `Ran into an error fetching ${cardName} for set ${modifiers.isSpecificSet} and number ${modifiers.isSpecificNumber}!`
    );
    return;
  }

  const printDetails: Card[] =
    cardDetails.scry.oracle_id && modifiers.isPrinting
      ? await getPrintList(cardDetails.scry)
      : [];

  const currentIndex: number = printDetails
    .map((card: Card) => card.id)
    .indexOf(cardDetails.scry.id);
  const cardObject: EmbedObject | undefined = await getCardMessageObject(
    message,
    cardDetails,
    printDetails.length > 0
      ? `   |   Printing ${currentIndex + 1} / ${printDetails.length}`
      : ""
  );

  if (!cardObject) return;

  const cardFoundMessage: Message = await message.channel.send({
    components:
      printDetails.length > 1
        ? [getActionButtonsRow(cardName).toJSON()]
        : [getPostActionButtonsRow(cardName).toJSON()],
    ...cardObject,
  });

  if (printDetails.length <= 1) return;

  await handlePrintingChoice(
    cardFoundMessage,
    message,
    printDetails,
    cardDetails
  );
}

export function getActionButtonsRow(cardName: string): ActionRowBuilder {
  const previousButton = new ButtonBuilder()
    .setCustomId("previous")
    .setLabel("←")
    .setStyle(ButtonStyle.Primary);

  const middleButton = new ButtonBuilder()
    .setLabel("Prints")
    .setURL(
      SCRYFALL_PRINTINGS_SEARCH.replace(
        "<<REPLACE>>",
        encodeURIComponent(cardName)
      )
    )
    .setStyle(ButtonStyle.Link);

  const nextButton = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("→")
    .setStyle(ButtonStyle.Primary);

  const deleteButton = new ButtonBuilder()
    .setCustomId("delete")
    .setLabel("╳")
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder().addComponents(
    previousButton,
    middleButton,
    nextButton,
    deleteButton
  );
}

export function getPostActionButtonsRow(cardName: string): ActionRowBuilder {
  const printButton = new ButtonBuilder()
    .setLabel("Prints")
    .setURL(
      SCRYFALL_PRINTINGS_SEARCH.replace(
        "<<REPLACE>>",
        encodeURIComponent(cardName)
      )
    )
    .setStyle(ButtonStyle.Link);

  const edhButton = new ButtonBuilder()
    .setLabel("EDHRec")
    .setURL(`${SCRYFALL_EDHREC_SEARCH}${encodeURIToBasic(cardName)}`)
    .setStyle(ButtonStyle.Link);

  const spellbookButton = new ButtonBuilder()
    .setLabel("Spellbook")
    .setURL(`${SCRYFALL_SPELLBOOK_URL}${encodeURIComponent(cardName)}`)
    .setStyle(ButtonStyle.Link);

  return new ActionRowBuilder().addComponents(
    printButton,
    edhButton,
    spellbookButton
  );
}

export function encodeURIToBasic(string: string) {
  return string
    .replace(REGEX_SCRYFALL_EDHREC_PATTERN, "")
    .replace(/[ ]/gu, "-")
    .toLocaleLowerCase();
}
