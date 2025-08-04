import { Channel, Message } from "discord.js";
import {
  REGEX_SCRYFALL_PATTERN,
  SCRYFALL_MINOR_SPELLING_MISTAKE_RESPONSES,
  SCRYFALL_MINOR_SPELLING_MISTAKE_STRING,
} from "../consts/constants";
import { Cards } from "scryfall-api";
import { scryfallCardFound } from "./scryfallCardFound";
import { scryfallNoCardFound } from "./scryfallNoCardFound";
import { scryfallShowCardList } from "./scryfallShowCardList";
import { isSendableChannel } from "../util/typeGuards";

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
    message.content.toLocaleLowerCase() ===
    SCRYFALL_MINOR_SPELLING_MISTAKE_STRING
  ) {
    await sendMinorSpellingMistakeGif(message.channel);
    return;
  }

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_SCRYFALL_PATTERN.exec(message.content)) !== null) {
    const isExact: boolean = match.groups?.card[0] !== "?";
    const cardName: string | undefined = match.groups?.card
      .substring(Number(!isExact))
      .trim();
    const isSpecificSet: string = match.groups?.set?.trim() ?? "";
    const isSpecificNumber: number = parseInt(
      match.groups?.number?.trim() ?? "0"
    );
    if (!cardName) return;

    promises.push(
      scryfallGetCard(
        message,
        cardName,
        isSpecificSet,
        isSpecificNumber,
        isExact
      )
    );
  }

  await Promise.all(promises);
}

export async function scryfallGetCard(
  message: Message,
  cardName: string,
  isSpecificSet: string | undefined = undefined,
  isSpecificNumber: number | undefined = undefined,
  isExact: boolean = true,
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
  } else if (
    results.length === 1 ||
    (results[0].toLocaleLowerCase() === cardName.toLocaleLowerCase() &&
      isExact) ||
    fromSelectMenu
  ) {
    await scryfallCardFound(
      message,
      results[0],
      isSpecificSet,
      isSpecificNumber
    );
  } else {
    await scryfallShowCardList(message, cardName, results);
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
