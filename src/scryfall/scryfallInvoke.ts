import { Message } from "discord.js";
import { REGEX_SCRYFALL_PATTERN } from "../consts/constants";
import { Cards } from "scryfall-api";
import { scryfallCardFound } from "./scryfallCardFound";
import { scryfallNoCardFound } from "./scryfallNoCardFound";
import { scryfallShowCardList } from "./scryfallShowCardList";

export async function scryfallInvoke(message: Message): Promise<void> {
  /*
   * The reality of this check is that it'll never really be relevant;
   * but unfortunately message.channel can be *any* Discord Channel,
   * which includes PartialGroupDMChannel, which doesn't have a send
   * attribute, so it gets very upset.
   *
   * Another unfortunate note is that this check here does not get the
   * typing exclusion passed down to other functions (eg scryfallNoCardFound)
   * so this check is needed in every function that uses channel.send.
   */
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_SCRYFALL_PATTERN.exec(message.content)) !== null) {
    const isImage: boolean = match.groups?.card[0] === "!";
    const cardName: string | undefined = match.groups?.card
      .substring(Number(isImage))
      .trim();
    const isSpecificSet: string = match.groups?.set?.trim() ?? "";
    if (!cardName) return;

    promises.push(scryfallGetCard(message, cardName, isSpecificSet));
  }

  await Promise.all(promises);
}

export async function scryfallGetCard(
  message: Message,
  cardName: string,
  isSpecificSet: string | undefined = undefined,
  fromSelectMenu: boolean = false
): Promise<void> {
  const results: string[] = await Cards.autoCompleteName(cardName);

  /*
   * An explanation for 'fromSelectMenu':
   * basically, if we get multiple cards from Scryfall (eg when searching 'pan')
   * then the user is given a choice of the 20 best matching cards (Scryfall limit).
   *
   * When the user picks a choice that is _also_ ambiguous (eg 'pandemonium'),
   * we don't want to show them another SelectMenu - otherwise they'll
   * forever loop trying to select the ambiguous card.
   *
   * If we call this function from scryfallShowCardList,
   * _always_ go straight to scryfallCardFound, using the first result if multiple.
   */
  if (!results.length) {
    scryfallNoCardFound(message, cardName);
  } else if (results.length === 1 || fromSelectMenu) {
    await scryfallCardFound(message, results[0], isSpecificSet);
  } else {
    await scryfallShowCardList(message, cardName, results);
  }
}


