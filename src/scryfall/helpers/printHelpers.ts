import { Card } from "scryfall-api";
import { Message, ButtonInteraction, Interaction } from "discord.js";
import { getCardMessageObject } from "../embedObjectBuilder";
import {
  getActionButtonsRow,
  getPostActionButtonsRow,
} from "../cardFound";
import { getCardDetails } from "./commonHelpers";
import { CardDetails, EmbedObject } from "../../types/scryfall/Invoke";

function getNextIndex(newIndex: number, max: number): number {
  if (newIndex === max) {
    return 0;
  } else if (newIndex === -1) {
    return max - 1;
  }

  return newIndex;
}

export async function handlePrintingChoice(
  message: Message,
  originalMessage: Message,
  printDetails: Card[],
  cardDetails: CardDetails
): Promise<void> {
  if (!cardDetails.scry) return;

  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) =>
    interaction.isButton() && interaction.user.id === originalMessage.author.id;
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
        originalMessage.delete().catch(console.error),
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
        originalMessage,
        printDetails,
        newCardDetails
      ),
    ]);
  } catch {
    await message
      .edit({
        components: [getPostActionButtonsRow(cardName).toJSON()],
      })
      .catch((err) => console.error(err));
  }
}
