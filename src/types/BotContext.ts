import { Client } from "discord.js";
import { Config } from "./Config";
import { RunState as RunState } from "./RunState";
import { ChanceResponse } from "./JSON";
import { Stats } from "./Stats";

export interface BotContext {
  client: Client;
  config: Config;
  currentDate: Date;
  isStatsEnabled: boolean;
  runState: RunState;
  rollTable: ChanceResponse[];
  splash: string;
  stats?: Stats;
  uptime: number;
}