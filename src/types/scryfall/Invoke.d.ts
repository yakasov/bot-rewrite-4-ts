import { Card } from "scryfall-api";
import { EDHRecResponse } from "./EDHRecResponse";

export interface Modifiers {
  isFuzzy: boolean;
  isPrinting: boolean;
  isSyntax: boolean;
  isSpecificSet: string;
  isSpecificNumber: number;
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

export interface CardDetails {
  scry?: Card;
  edh?: EDHRecResponse;
}