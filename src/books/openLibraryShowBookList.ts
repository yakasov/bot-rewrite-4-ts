import {
  ActionRowBuilder,
  Interaction,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { OpenLibraryTypes } from "../types/books/OpenLibraryResponse";
import { isSendableChannel } from "../util/typeGuards";
import { openBooksFound } from "./openLibraryInvoke";

export async function openLibraryShowBookList(
  message: Message,
  results: OpenLibraryTypes.Book[],
  input: string
): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

  const uniqueResults: OpenLibraryTypes.Book[] = results
    .filter(
      (book, index, self) =>
        index ===
        self.findIndex(
          (b) =>
            b.title === book.title &&
            b.author_name?.join(", ") === book.author_name?.join(", ")
        )
    )
    .slice(0, 25);

  const selectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
    .setCustomId("openlibrary_book_select")
    .setPlaceholder("Choose a book")
    .addOptions(
      uniqueResults.map((book: OpenLibraryTypes.Book, i: number) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(
            `${i + 1}. ${book.title} by ${
              book.author_name?.length === 1
                ? book.author_name[0]
                : `${book.author_name?.length ?? "Unknown"} Authors`
            }`.substring(0, 100)
          )
          .setValue(book.key)
      )
    );

  const row: ActionRowBuilder = new ActionRowBuilder().addComponents(
    selectMenu
  );

  const multipleBooksMessage: Message = await message.channel.send({
    components: [row.toJSON()],
    content: `Multiple books found for ${input}!`,
  });

  const filter: (interaction: Interaction) => boolean = (
    interaction: Interaction
  ) =>
    interaction.isStringSelectMenu() &&
    interaction.user.id === message.author.id;

  try {
    const collected: StringSelectMenuInteraction =
      (await multipleBooksMessage.awaitMessageComponent({
        filter,
        time: 30_000,
      })) as StringSelectMenuInteraction;

    const [selectedValue]: string[] = collected.values;
    await collected.update({
      components: [],
      content: `Fetching ${selectedValue}...`,
    });

    await openBooksFound(
      message,
      uniqueResults.find((result) => result.key === selectedValue)!
    );
    await multipleBooksMessage.delete().catch((err) => console.error(err));
  } catch (err: any) {
    await multipleBooksMessage.edit({
      components: [],
      content: "No selection made in time.",
    });
  }
}
