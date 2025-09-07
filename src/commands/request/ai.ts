import fs from "fs";
import {
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from "discord.js";
import {
  AI_DEFAULT_TEMP,
  AI_REQUEST_ATTEMPTS,
  AI_MAX_TOKENS,
  AI_MODEL,
  REGEX_DISCORD_MESSAGE_LENGTH,
} from "../../consts/constants";
import type { BotContext } from "../../types/BotContext.d.ts";
import OpenAI from "openai";
import { keys } from "../../keys";
import {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionUserMessageParam,
} from "openai/resources/index";
import type { OpenAIConversation } from "../../types/OpenAI.d.ts";

const openai: OpenAI | undefined = keys.OPENAI_TOKEN ? new OpenAI({
  apiKey: keys.OPENAI_TOKEN,
}) : undefined;
const initialMessage: OpenAIConversation = {
  content: `You are a casual Discord chatting bot chatting in my personal 
  Discord server. Your name is 'outputbot'. Others may ask for you to act or 
  roleplay as something else, and you should try and carry out that request 
  if you can! Feel free to respond to any request.`,
  role: "system",
};
let conversation: OpenAIConversation[] = [initialMessage];

export default {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Uses OpenAI API to generate an AI response")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("prompt")
        .setDescription("The prompt to give ChatGPT")
        .setRequired(true)
    )
    .addNumberOption((opt: SlashCommandNumberOption) =>
      opt
        .setName("temperature")
        .setDescription("Optional temperature parameter")
        .setMinValue(0)
        .setMaxValue(2)
    ),
  async execute(interaction: ChatInputCommandInteraction, context: BotContext) {
    if (
      !openai ||
      !context.config.bot.aiChannels.includes(`${interaction.channelId}`)
    ) {
      return;
    }

    await interaction.deferReply();

    const prompt: string = interaction.options.getString("prompt") as string;
    const temperature: number =
      interaction.options.getNumber("temperature") ?? AI_DEFAULT_TEMP;

    if (!prompt || prompt.length < 2) {
      return interaction.followUp("Prompt too short.");
    }

    await interaction.followUp(`Given prompt: ${prompt}`);

    let response: ChatCompletion | null = null;
    let attempts = 0;
    const timestamp: number = Date.now();

    conversation = conversation.concat({
      content: prompt,
      role: "user",
    });

    while (attempts < AI_REQUEST_ATTEMPTS + 1 && !response) {
      try {
        attempts++;
        response = await openai.chat.completions.create({
          max_tokens: AI_MAX_TOKENS,
          messages: conversation as ChatCompletionUserMessageParam[],
          model: AI_MODEL,
          temperature,
        });
      } catch (err: unknown) {
        handleAIError(err, interaction, attempts, timestamp);
        shortenConversation();
      }
    }

    if (response && response.choices[0].message) {
      const responseMessage: ChatCompletionMessage =
        response.choices[0].message;
      if (typeof responseMessage.content === "string") {
        conversation = conversation.concat({
          content: responseMessage.content,
          role: responseMessage.role,
        });
        const responseArray: RegExpMatchArray | [] =
          responseMessage.content.match(REGEX_DISCORD_MESSAGE_LENGTH) || [];
        for (const r of responseArray) {
          await interaction.followUp(r);
        }
      } else {
        await interaction.followUp("AI response was empty or invalid.");
      }
    } else {
      await interaction.followUp(
        "Failed after 3 attempts, please try again - your conversation shouldn't be affected!"
      );
    }
  },
};

function handleAIError(
  err: unknown,
  interaction: Interaction,
  attempts: number,
  timestamp: number
): void {
  fs.writeFile(
    `./logs/ai-${interaction.user.id}-${timestamp}-${attempts}.txt`,
    formatMessages(err, conversation),
    "utf8",
    () => {
      // No callback
    }
  );

  console.error(err);
}

function formatMessages(err: unknown, messages: OpenAIConversation[]): string {
  let string = `${err}\n\n`;
  messages.forEach((message) => {
    string += `Role: ${message.role}\nContent: ${message.content}\n\n`;
  });
  return string;
}

function shortenConversation(): OpenAIConversation[] {
  return [initialMessage].concat(
    conversation.slice(Math.floor(conversation.length / 2), conversation.length)
  );
}
