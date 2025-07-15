import { Client, Events, Message, VoiceState } from "discord.js";
import configJson from "../resources/config.json";
import { BotContext } from "./types/BotContext";
import { createBotContext } from "./context/createBotContext";
import { Config } from "./types/Config";
import { messagePrototypeCatch } from "./patch/messagePrototypeCatch";
import { loadCommands } from "./commands/loadCommands";
import { handleClientReady } from "./events/handleClientReady";
import { handleInteractionCreate } from "./events/handleInteractionCreate";
import { handleMessageCreate } from "./events/handleMessageCreate";
import { handleVoiceStateUpdate } from "./events/handleVoiceStateUpdate";
import { Stats } from "./types/Stats";
import { loadStatsFromDatabase } from "./database/loadFromDatabase";

process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

let loadedStats: Stats | undefined = undefined;
Promise.resolve(async () => {
  loadedStats = await loadStatsFromDatabase();
});

const config: Config = configJson;
const botContext: BotContext = createBotContext(config, loadedStats);

messagePrototypeCatch();
Promise.resolve(async () => await loadCommands(botContext.client));

botContext.client.once(Events.ClientReady, (client: Client) =>
  handleClientReady(client, botContext)
);
botContext.client.on(Events.InteractionCreate, handleInteractionCreate);
botContext.client.on(Events.MessageCreate, (message: Message) =>
  handleMessageCreate(message, botContext)
);
botContext.client.on(
  Events.VoiceStateUpdate,
  (oldState: VoiceState, newState: VoiceState) =>
    handleVoiceStateUpdate(oldState, newState, botContext)
);

botContext.client.login();