import { Events } from "discord.js";
import configJson from "../resources/config.json";
import { BotContext } from "./types/BotContext";
import { createBotContext } from "./context/createBotContext";
import { Config } from "./types/Config";
import { messagePrototypeCatch } from "./patch/messagePrototypeCatch";
import { loadCommands } from "./commands/loadCommands";

process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

const config: Config = configJson;
const botContext: BotContext = createBotContext(config); // TODO: add loadedStats here

messagePrototypeCatch();
Promise.resolve(async () => await loadCommands(botContext.client));

botContext.client.once(Events.ClientReady, handleClientReady);
botContext.client.on(Events.InteractionCreate, handleInteractionCreate);
botContext.client.on(Events.MessageCreate, handleMessageCreate);
botContext.client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);
