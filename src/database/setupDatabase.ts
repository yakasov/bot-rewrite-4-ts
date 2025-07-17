import fs from "node:fs";
import configJson from "../../resources/config.json";
import { Pool } from "mariadb";
import { BotContext } from "../types/BotContext";
import {
  createTables,
  getDatabasePool,
  initialiseDatabase,
} from "./initialiseDatabase";
import { Stats } from "../types/Stats";
import { saveStatsToDatabase } from "./saveToDatabase";
import { createBotContext } from "../context/createBotContext";
import { Config } from "../types/Config";

export async function setupDatabase(): Promise<void> {
  const config: Config = configJson;
  const context: BotContext = createBotContext(config);

  try {
    initialiseDatabase();
    await createTables();

    if (fs.existsSync("./resources/stats.json")) {
      try {
        const statsData: Stats = JSON.parse(
          fs.readFileSync("./resources/stats.json", "utf-8")
        );
        context.stats = statsData;

        await saveStatsToDatabase(context);
      } catch (err: any) {
        console.error("Error migrating stats:", err);
      }
    }
  } catch (err: any) {
    console.error("Database setup failed:", err);
  } finally {
    await closeDatabase();
  }
}

async function closeDatabase() {
  const pool: Pool = getDatabasePool();

  if (!pool.closed) {
    await pool.end();
  }
}
