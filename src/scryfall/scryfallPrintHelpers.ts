import { Card } from "yakasov-scryfall-api";
import type { OracleResponse } from "../types/scryfall/OracleResponse.d.ts";
import { Message, ButtonInteraction, Interaction } from "discord.js";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";
import { getActionButtonsRow } from "./scryfallCardFound";
import { getCardDetails } from "./scryfallHelpers";

const printCache: Record<string, Card[]> = {};

export async function getPrintList(card: Card): Promise<Card[]> {
  if (!card.oracle_id) return [];

  if (!printCache[card.oracle_id]) {
    printCache[card.oracle_id] = await fetch(card.prints_search_uri)
      .then((response: Response) => response.json())
      .then((response: OracleResponse) => response.data);
  }

  return printCache[card.oracle_id];
}

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
  originalAuthorId: string,
  printDetails: Card[],
  cardDetails: Card
) {
  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) => interaction.isButton() && interaction.user.id === originalAuthorId;

  try {
    const collected: ButtonInteraction = (await message.awaitMessageComponent({
      filter,
      time: 30_000,
    })) as ButtonInteraction;

    const currentIndex: number = printDetails
      .map((card: Card) => card.id)
      .indexOf(cardDetails.id);
    let nextIndex: number;

    if (collected.customId === "previous") {
      nextIndex = getNextIndex(currentIndex - 1, printDetails.length);
    } else {
      nextIndex = getNextIndex(currentIndex + 1, printDetails.length);
    }

    const newCardDetails: Card = (await getCardDetails(
      cardDetails.name,
      printDetails[nextIndex].set,
      parseInt(printDetails[nextIndex].collector_number)
    )) as Card;
    const cardObject = await getCardMessageObject(
      message,
      newCardDetails,
      `   |   ${nextIndex + 1} / ${printDetails.length}`
    );

    // Should never be true, just a type guard
    if (!newCardDetails || !cardObject) return;

    await collected.update({
      components: [getActionButtonsRow(newCardDetails.name).toJSON()],
      ...cardObject,
    });

    handlePrintingChoice(
      message,
      originalAuthorId,
      printDetails,
      newCardDetails
    );
  } catch {
    await message
      .edit({
        components: [],
      })
      .catch((err) => console.error(err));
  }
}
