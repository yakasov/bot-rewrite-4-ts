import {
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  Interaction,
  StringSelectMenuInteraction,
} from "discord.js";
import { scryfallGetCard } from "./scryfallInvoke";
import { isSendableChannel } from "../util/typeGuards";
import type { EmbedObject, Modifiers } from "../types/scryfall/Invoke.d.ts";
import { getCardMessageObject } from "./scryfallEmbedObjectBuilder";
import { getCardDetails } from "./scryfallHelpers";
import { Card } from "yakasov-scryfall-api";

export async function scryfallShowCardList(
  message: Message,
  results: string[],
  modifiers: Modifiers
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const selectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
    .setCustomId("scryfall_list_select")
    .setPlaceholder("Select other cards...")
    .addOptions(
      results
        .slice(1)
        .map((card: string, i: number) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}. ${card}`)
            .setValue(card)
        )
    );

  const selectMenuRow: ActionRowBuilder = new ActionRowBuilder().addComponents(
    selectMenu
  );

  const cardDetails: Card = (await getCardDetails(results[0])) as Card;
  const cardMessageObject: EmbedObject = (await getCardMessageObject(
    message,
    cardDetails
  )) as EmbedObject;
  const multipleCardsMessage: Message = await message.channel.send({
    components: [selectMenuRow.toJSON()],
    content: modifiers.syntaxInfo
      ? `[__Click here to see ${modifiers.syntaxInfo.totalCards} results on Scryfall!__](${modifiers.syntaxInfo.searchURL})`
      : "",
    embeds: cardMessageObject.embeds,
    files: cardMessageObject.files,
  });

  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) =>
    interaction.isStringSelectMenu() &&
    interaction.user.id === message.author.id;

  try {
    const collected: StringSelectMenuInteraction =
      (await multipleCardsMessage.awaitMessageComponent({
        filter,
        time: 30_000,
      })) as StringSelectMenuInteraction;

    let [selectedValue]: string[] = collected.values;
    await collected.update({
      components: [],
      content: `Fetching ${selectedValue}...`,
    });

    if (modifiers.isSyntax) {
      selectedValue += ` ${selectedValue}`;
    }

    await Promise.all([
      scryfallGetCard(message, selectedValue, modifiers, true),
      multipleCardsMessage.delete().catch((err) => console.error(err)),
    ]);
  } catch {
    await multipleCardsMessage
      .edit({
        components: [],
      })
      .catch((err) => console.error(err));
  }
}
