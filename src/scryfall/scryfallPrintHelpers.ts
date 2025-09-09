import { Card } from "yakasov-scryfall-api";
import { Message, ButtonInteraction, Interaction } from "discord.js";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";
import { getActionButtonsRow } from "./scryfallCardFound";
import { getCardDetails } from "./scryfallHelpers";

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
  cardDetails: Card
) {
  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) => interaction.isButton() && interaction.user.id === originalMessage.author.id;

  try {
    const collected: ButtonInteraction = (await message.awaitMessageComponent({
      filter,
      time: 30_000,
    })) as ButtonInteraction;

    const currentIndex: number = printDetails
      .map((card: Card) => card.id)
      .indexOf(cardDetails.id);
    let nextIndex: number = 0;

    if (collected.customId === "previous") {
      nextIndex = getNextIndex(currentIndex - 1, printDetails.length);
    } else if (collected.customId === "next") {
      nextIndex = getNextIndex(currentIndex + 1, printDetails.length);
    } else {
      await Promise.all([
        message.delete().catch(() => {}),
        originalMessage.delete().catch(() => {})
      ]);
      return;
    }

    const newCardDetails: Card = (await getCardDetails(
      cardDetails.name,
      printDetails[nextIndex].set,
      parseInt(printDetails[nextIndex].collector_number)
    )) as Card;
    const cardObject = await getCardMessageObject(
      message,
      newCardDetails,
      `   |   Printing ${nextIndex + 1} / ${printDetails.length}`
    );

    // Should never be true, just a type guard
    if (!newCardDetails || !cardObject) return;

    Promise.all([
      collected.update({
        components: [getActionButtonsRow(newCardDetails.name).toJSON()],
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
        components: [],
      })
      .catch((err) => console.error(err));
  }
}
