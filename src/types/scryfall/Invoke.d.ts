import { Card } from "scryfall-api";
import { EDHRecResponse } from "./EDHRecResponse";
import { Message } from "discord.js";

/**
 * Potential Scryfall fetch modifiers.
 */
export interface Modifiers {
  /** Whether to ignore exact name matches. */
  isFuzzy: boolean;

  /** Whether to show the printing action row. */
  isPrinting: boolean;

  /** Whether to use the invocation exactly as given in the Scryfall API. */
  isSyntax: boolean;

  /** Whether a specific set tag has been provided. */
  isSpecificSet: string;

  /** Whether a specific card number has been provided. */
  isSpecificNumber: number;

  /** Used internally for tracking information about a syntax search. */
  syntaxInfo?: SyntaxInfo;
}

export interface SyntaxInfo {
  totalCards: number;
  searchURL: string;
}

export interface EmbedObject {
  embeds?: EmbedBuilder[];
  files?: AttachmentBuilder[];
}

/**
 * A combined object for multiple sources of card details.
 */
export interface CardDetails {
  /** The Scryfall API object for a given card. */
  scry?: Card;

  /** The scraped EDHRec object from the EDHRec site for a given card. */
  edh?: EDHRecResponse;

  /** The fast response to send (void of any EDHRec data). */
  quickMessage?: Message;
}
