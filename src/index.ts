import { Client, Events, GatewayIntentBits } from "discord.js";
import { BotContext } from "./context/BotContext";
import { createBotContext } from "./context/createBotContext";

process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

// TODO
const botContext: BotContext = createBotContext(config, loadedStats);