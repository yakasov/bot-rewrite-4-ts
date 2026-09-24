import type { BotContext } from "../types/BotContext.d.ts";

export async function handleVoiceTranscript(
  guildId: string,
  userId: string,
  text: string,
  context: BotContext
): Promise<void> {
  console.log(`Transcript from ${userId}: ${text}`);
}