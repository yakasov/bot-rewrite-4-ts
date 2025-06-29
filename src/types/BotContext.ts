import { Client } from "discord.js";
import { Config } from "./Config";
import { FirstRun } from "./FirstRun";
import { RollTableEntry } from "./RollTableEntry";
import { Stats } from "./Stats";

export interface BotContext {
  client: Client;
  config: Config;
  currentDate: Date;
  firstRun: FirstRun;
  rollTable: RollTableEntry[];
  splash: string;
  stats?: Stats;
  uptime: number;
}