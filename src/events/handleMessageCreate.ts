import { Message } from "discord.js";
import { BotContext } from "../types/BotContext";

export async function handleMessageCreate(message: Message, context: BotContext) {
  if (message.author.bot || !message.guild) return;

  await checkScryfallMessage();
  await checkMessageResponse();
  if (context.config.bot.allowResponses) {
    await checkMessageReactions();
  }
  
  addToStats({
    guildId: message.guild.id,
    type: "message",
    userId: message.author.id
  });
}