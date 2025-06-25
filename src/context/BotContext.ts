import { Client } from "discord.js";
import { Config } from "../types/Config";
import { FirstRun } from "../types/FirstRun";
import { RollTableEntry } from "../types/RollTableEntry";
import { Stats } from "../types/Stats";

export interface BotContext {
  client: Client;
  config: Config;
  currentDate: Date;
  firstRun: FirstRun;
  rollTable: RollTableEntry[];
  splash: string;
  stats: Stats;
  uptime: number;
}