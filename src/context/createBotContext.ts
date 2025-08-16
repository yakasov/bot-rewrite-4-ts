import { Client, GatewayIntentBits } from "discord.js";
import moment from "moment-timezone";
import { Config } from "../types/Config";
import { Stats } from "../types/Stats";
import { BotContext } from "../types/BotContext";
import { generateRollTable } from "../util/generateRollTable";

export function createBotContext(
  config: Config
): BotContext {
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

  return {
    client,
    config,
    currentDate: moment().tz("Europe/London").toDate(),
    isStatsEnabled: true,
    runState: { birthdays: 1, minecraft: 1 },
    rollTable: generateRollTable(),
    splash: "",
    stats: undefined,
    uptime: 0,
  };
}
