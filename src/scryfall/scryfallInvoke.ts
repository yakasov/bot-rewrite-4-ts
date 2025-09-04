import { Channel, Message } from "discord.js";
import {
  REGEX_SCRYFALL_PATTERN,
  SCRYFALL_MINOR_SPELLING_MISTAKE_RESPONSES,
  SCRYFALL_MINOR_SPELLING_MISTAKE_STRINGS,
  SCRYFALL_SYNTAX_PREFIX,
} from "../consts/constants";
import { Card, Cards } from "yakasov-scryfall-api";
import { scryfallCardFound } from "./scryfallCardFound";
import { scryfallNoCardFound } from "./scryfallNoCardFound";
import { scryfallShowCardList } from "./scryfallShowCardList";
import { isSendableChannel } from "../util/typeGuards";
import { Modifiers } from "../types/scryfall/Invoke";

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
  if (!isSendableChannel(message.channel)) return;

  if (
    message.content.toLocaleLowerCase() &&
    SCRYFALL_MINOR_SPELLING_MISTAKE_STRINGS.some((string) =>
      message.content.includes(string)
    )
  ) {
    await sendMinorSpellingMistakeGif(message.channel);
    return;
  }

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_SCRYFALL_PATTERN.exec(message.content)) !== null) {
    const firstString: string = match.groups?.card ?? "";

    const modifiers: Modifiers = {
      isFuzzy: firstString.trim()[0] === "?",
      isSyntax: firstString.trim()[0] === "*",
      isSpecificSet: match.groups?.set?.trim() ?? "",
      isSpecificNumber: parseInt(match.groups?.number?.trim() ?? "0"),
    };
    let cardName: string | undefined = firstString
      .trim()
      .substring(Number(modifiers.isFuzzy))
      .substring(Number(modifiers.isSyntax));

    if (!cardName && !modifiers.isSpecificSet && !modifiers.isSpecificNumber)
      return;

    if (modifiers.isSyntax) {
      cardName = SCRYFALL_SYNTAX_PREFIX + cardName;
    }

    promises.push(scryfallGetCard(message, cardName, modifiers));
  }

  let fetchingMultipleMessage: Message | undefined;
  if (promises.length > 1) {
    fetchingMultipleMessage = await message.reply(
      `Fetching ${promises.length} cards...`
    );
  }

  await Promise.all(promises);
  if (fetchingMultipleMessage) {
    await fetchingMultipleMessage.delete().catch(console.error);
  }
}

export async function scryfallGetCard(
  message: Message,
  cardName: string = "",
  modifiers: Modifiers,
  fromSelectMenu: boolean = false
): Promise<void> {
  let results: string[] = [""];

  if (modifiers.isSyntax) {
    results = (await Cards.search(cardName).get(25)).map(
      (card: Card) => card.name
    );
  } else if (cardName) {
    results = await Cards.autoCompleteName(cardName);
  }

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
    await scryfallNoCardFound(message, cardName);
  } else if (
    results.length === 1 ||
    (results[0].toLocaleLowerCase() === cardName.toLocaleLowerCase() &&
      !modifiers.isFuzzy) ||
    fromSelectMenu
  ) {
    await scryfallCardFound(
      message,
      results[0],
      modifiers.isSpecificSet,
      modifiers.isSpecificNumber
    );
  } else {
    await scryfallShowCardList(message, results, modifiers);
  }
}

export async function sendMinorSpellingMistakeGif(channel: Channel) {
  // Obviously this will never, ever fail but TS will get upset without it
  if (!isSendableChannel(channel)) return;

  const randomGif: string =
    SCRYFALL_MINOR_SPELLING_MISTAKE_RESPONSES[
      Math.floor(
        Math.random() * SCRYFALL_MINOR_SPELLING_MISTAKE_RESPONSES.length
      )
    ];
  const lastMessage: Message | undefined = await channel.messages
    .fetch({ limit: 2 })
    .then((c) => [...c.values()].pop());

  if (!lastMessage) {
    await channel.send(randomGif);
  } else {
    await lastMessage.reply(randomGif);
  }
}
