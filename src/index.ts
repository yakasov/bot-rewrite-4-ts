import { Events, Interaction, Message, VoiceState } from "discord.js";
import configJson from "../resources/config.json";
import type { BotContext } from "./types/BotContext.d.ts";
import { createBotContext } from "./context/createBotContext";
import type { Config } from "./types/Config.d.ts";
import { messagePrototypeCatch } from "./patch/messagePrototypeCatch";
import { loadCommands } from "./commands/loadCommands";
import { handleClientReady } from "./events/handleClientReady";
import { handleInteractionCreate } from "./events/handleInteractionCreate";
import { handleMessageCreate } from "./events/handleMessageCreate";
import { handleVoiceStateUpdate } from "./events/handleVoiceStateUpdate";
import { loadStatsFromDatabase } from "./database/loadFromDatabase";
import { databaseKeysPresent } from "./keys";

process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

const config: Config = configJson;
const botContext: BotContext = createBotContext(config);

botContext.client.once(Events.ClientReady, async () => {
  await loadCommands(botContext.client);

  botContext.stats = databaseKeysPresent ? await loadStatsFromDatabase() : undefined;
  if (!botContext.stats) botContext.isStatsEnabled = false;

  handleClientReady(botContext);
});
botContext.client.on(Events.InteractionCreate, (interaction: Interaction) =>
  handleInteractionCreate(interaction, botContext)
);
botContext.client.on(Events.MessageCreate, (message: Message) =>
  handleMessageCreate(message, botContext)
);
botContext.client.on(
  Events.VoiceStateUpdate,
  (oldState: VoiceState, newState: VoiceState) =>
    handleVoiceStateUpdate(oldState, newState, botContext)
);

messagePrototypeCatch();
botContext.client.login();
