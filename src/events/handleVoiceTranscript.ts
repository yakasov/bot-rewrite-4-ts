import { Client, GuildMember } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import { REGEX_SWEAR_JAR } from "../consts/constants.js";

// Keep this filth out of consts
const FILTH: string[] = ["shit", "fuck", "cunt", "retard", "cock", "bitch"];
const currentPartials: Record<string, string> = {};

export async function handleVoiceTranscript(
  guildId: string,
  userId: string,
  text: string,
  context?: BotContext,
  isPartial: boolean = false
): Promise<void> {
  const partialKey: string = `${guildId}:${userId}`;
  let newText: string;

  // If we have the full transcript, reset the current partial tracking
  if (!isPartial) {
    currentPartials[partialKey] = "";
    return;
  }

  // If we have a partial incoming, and no partial is saved, use the whole partial as the new text
  // Otherwise, try and get just the new part of the text
  if (
    currentPartials[partialKey] == "" ||
    currentPartials[partialKey] == null
  ) {
    newText = text;
  } else {
    newText = text.replace(currentPartials[partialKey], "");
  }
  currentPartials[partialKey] = text;

  console.log(
    `Transcript from ${userId} (${isPartial ? "partial" : "final"}): ${text}`
  );

  await checkSwears(guildId, userId, newText, context);
}

async function checkSwears(
  guildId: string,
  userId: string,
  text: string,
  context?: BotContext
): Promise<void> {
  if (!context) return;

  const member: GuildMember | undefined = context.client.guilds.cache
    .get(guildId)
    ?.members.cache.get(userId);
  const name: string | null = member ? member.displayName : null;

  if (!name) return;

  const match: RegExpMatchArray | null = name.match(REGEX_SWEAR_JAR);
  const number: number = match?.[1] ? Number(match[1]) : 0;
  const nickname: string | undefined = match?.[2];

  if (!nickname) return;

  let newNumber = number;
  for (const word of text.split(" ")) {
    if (FILTH.includes(word.toLowerCase())) {
      newNumber++;
    }
  }

  if (newNumber !== number) {
    const newName: string = `[${newNumber}] ${nickname}`;
    await (member?.setNickname(newName, "Stop swearing!"));
  }
}
