import { Channel, Client, GuildMember } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import {
  REGEX_SWEAR_JAR,
  THIS_ID_IS_A_CHANNEL_AND_IS_WHERE_THE_VOICE_TRANSCRIPT_SHOULD_BE_LOGGED_LOLOLOLOLOLOL,
} from "../consts/constants.js";
import { isSendableChannel } from "../util/typeGuards.js";

// Keep this filth out of consts
const FILTH: string[] = ["shit", "shitting", "fucking", "fuck", "cunt", "retard", "bitch", "whore"];
const currentPartials: Record<string, string> = {};
let stringToSend = "";
let messageCounter = 0;

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

  await checkSwears(guildId, userId, newText, context);
}

async function checkSwears(
  guildId: string,
  userId: string,
  newText: string,
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
  for (const word of newText.split(" ")) {
    if (FILTH.includes(word.toLowerCase())) {
      newNumber++;
    }
  }

  // Don't set a reason on setNickname since this clogs up the audit log enough as is
  if (newNumber !== number) {
    const newName: string = `[${newNumber}] ${nickname}`;
    await member?.setNickname(newName);
  }

  messageCounter++;
  stringToSend = `${stringToSend} ${newText.replace("[PARTIAL]", "")}`;

  if (messageCounter === 5) {
    const botChannel: Channel | undefined = context.client.channels.cache.get(
      THIS_ID_IS_A_CHANNEL_AND_IS_WHERE_THE_VOICE_TRANSCRIPT_SHOULD_BE_LOGGED_LOLOLOLOLOLOL
    );

    if (botChannel && isSendableChannel(botChannel)) {
      await botChannel.send(`${new Date().toLocaleString("en-GB")}: ${stringToSend}`);
    }

    messageCounter = 0;
    stringToSend = "";
  }
}
