import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";
import { handlePrintingChoice, getPrintList } from "./scryfallPrintHelpers";
import { Card } from "yakasov-scryfall-api";

export async function scryfallCardFound(
  message: Message,
  cardName: string,
  set: string | undefined = undefined,
  number: number | undefined = undefined
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  let [cardDetails, cardObject] = await getCardMessageObject(
    message,
    cardName,
    set,
    number
  );

  if (!cardObject || !cardDetails) return;

  const cardFoundMessage: Message = await message.channel.send({
    components: [getActionButtonsRow().toJSON()],
    ...cardObject,
  });

  // We can't do a print search with an oracle_id
  if (!cardDetails.oracle_id) return;

  const printDetails: Card[] = await getPrintList(cardDetails);

  if (printDetails.length === 1) return;

  await handlePrintingChoice(cardFoundMessage, message.author.id, printDetails, cardDetails);
}

export function getActionButtonsRow(): ActionRowBuilder {
  const previousButton = new ButtonBuilder()
    .setCustomId("previous")
    .setLabel("< Previous")
    .setStyle(ButtonStyle.Primary);

  const middleButton = new ButtonBuilder()
    .setCustomId("unused")
    .setLabel("Printings")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

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
