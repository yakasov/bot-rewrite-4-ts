import { Card } from "scryfall-api";
import { Message, ButtonInteraction, Interaction } from "discord.js";
import { getCardMessageObject } from "../embedObjectBuilder";
import {
  getActionButtonsRow,
  getPostActionButtonsRow,
} from "../cardFound";
import { getCardDetails } from "./commonHelpers";
import { CardDetails, EmbedObject } from "../../types/scryfall/Invoke";

/**
 * Used for determining the index of a wrap-around embed.
 * 
 * @param newIndex 
 * @param max - the max amount of pages the embed has
 * @returns the new index position, wrapping around to 0 if greater than max
 */
function getNextIndex(newIndex: number, max: number): number {
  if (newIndex === max) {
    return 0;
  } else if (newIndex === -1) {
    return max - 1;
  }

  return newIndex;
}

/**
 * Updates the card embed based on the interaction when choosing a printing.
 * 
 * @param message - the card embed message
 * @param authorId - the ID of the user who originally invoked Scryfall
 * @param printDetails - an array of Card objects, one for each printing
 * @param cardDetails - the card details to display on the embed, to avoid refetching
 */
export async function handlePrintingChoice(
  message: Message,
  authorId: string,
  printDetails: Card[],
  cardDetails: CardDetails
): Promise<void> {
  if (!cardDetails.scry) return;

  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) =>
    interaction.isButton() && interaction.user.id === authorId;
  const cardName = cardDetails.scry.name;

  try {
    const collected: ButtonInteraction = (await message.awaitMessageComponent({
      filter,
      time: 30_000,
    })) as ButtonInteraction;

    const currentIndex: number = printDetails
      .map((card: Card) => card.id)
      .indexOf(cardDetails.scry.id);
    let nextIndex = 0;

    if (collected.customId === "previous") {
      nextIndex = getNextIndex(currentIndex - 1, printDetails.length);
    } else if (collected.customId === "next") {
      nextIndex = getNextIndex(currentIndex + 1, printDetails.length);
    } else {
      await Promise.all([
        message.delete().catch(console.error),
      ]);
      return;
    }

    const newCardDetails: CardDetails = (
      await getCardDetails(
        cardDetails.scry.name,
        printDetails[nextIndex].set,
        parseInt(printDetails[nextIndex].collector_number),
        cardDetails.edh
      )
    );
    const cardObject: EmbedObject | undefined = await getCardMessageObject(
      message,
      newCardDetails,
      `   |   Printing ${nextIndex + 1} / ${printDetails.length}`
    );

    // Should never be true, just a type guard
    if (!newCardDetails || !cardObject) return;

    Promise.all([
      collected.update({
        components: [getActionButtonsRow(cardName).toJSON()],
        ...cardObject,
      }),
      handlePrintingChoice(
        message,
        authorId,
        printDetails,
        newCardDetails
      ),
    ]);
  } catch {
    await message
      .edit({
        components: [getPostActionButtonsRow(cardName).toJSON()],
      })
      .catch(console.error);
  }
}
