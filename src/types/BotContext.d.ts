import { Client } from "discord.js";
import { Config } from "./Config";
import { RunState as RunState } from "./RunState";
import { ChanceResponse } from "./ChanceResponse";
import { Stats } from "./Stats";
import { CurrentWeather, Weather } from "openweather-api-node";

export interface BotContext {
  client: Client;
  config: Config;
  currentDate: Date;
  isStatsEnabled: boolean;
  runState: RunState;
  rollTable: ChanceResponse[];
  splash: string;
  stats?: Stats;
  weather: CurrentWeather;
  uptime: number;
}