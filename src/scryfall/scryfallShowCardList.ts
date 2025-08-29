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
import { Modifiers } from "../types/scryfall/Invoke";

export async function scryfallShowCardList(
  message: Message,
  cardName: string,
  results: string[],
  modifiers: Modifiers
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const selectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
    .setCustomId("scryfall_list_select")
    .setPlaceholder("Choose a card")
    .addOptions(
      results.map((card: string, i: number) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(`${i + 1}. ${card}`)
          .setValue(card)
      )
    );

  const row: ActionRowBuilder = new ActionRowBuilder().addComponents(
    selectMenu
  );

  const multipleCardsMessage: Message = await message.channel.send({
    components: [row.toJSON()],
    content: `Multiple cards found for "${cardName}"!`,
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
      selectedValue += ` ${selectedValue}`
    }

    await scryfallGetCard(message, selectedValue, modifiers, true);
    await multipleCardsMessage.delete().catch((err) => console.error(err));
  } catch (err: any) {
    console.error(err);
    await multipleCardsMessage.edit({
      components: [],
      content: "No selection made in time.",
    });
  }
}
