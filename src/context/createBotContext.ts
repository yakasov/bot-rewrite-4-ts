import { Client, GatewayIntentBits } from "discord.js";
import moment from "moment-timezone";
import type { Config } from "../types/Config.d.ts";
import type { BotContext } from "../types/BotContext.d.ts";
import { generateRollTable } from "../util/generateRollTable";
import * as DiscordSpeechRecognition from "@midspike/discord-speech-recognition";
import { THIS_ID_SHOULD_BE_VOICE_PROCESSED } from "../consts/constants.js";

export function createBotContext(config: Config): BotContext {
  const client = new Client({
    allowedMentions: {
      parse: ["users", "roles"],
      repliedUser: true,
    },
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  });

  DiscordSpeechRecognition.attachSpeechEvent({
    client: client as any,
    shouldProcessUserId: async (userId) =>
      userId === THIS_ID_SHOULD_BE_VOICE_PROCESSED,
  });

  return {
    client,
    config,
    currentDate: moment().tz("Europe/London").toDate(),
    isStatsEnabled: true,
    runState: { birthdays: 1, minecraft: 1, presence: 0 },
    rollTable: generateRollTable(),
    splash: "",
    stats: undefined,
    uptime: 0,
  };
}
