export interface Modifiers {
  isFuzzy: boolean;
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
