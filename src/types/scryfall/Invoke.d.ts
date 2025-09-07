export interface Modifiers {
  isFuzzy: boolean;
  isSyntax: boolean;
  isSpecificSet: string;
  isSpecificNumber: number;
}

export interface EmbedObject {
  embeds?: EmbedBuilder[];
  files?: AttachmentBuilder[];
}
