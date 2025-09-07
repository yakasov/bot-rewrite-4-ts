import fs from "node:fs";
import moment from "moment-timezone";
import type { Stats } from "../types/Stats.d.ts";
import { loadStatsFromDatabase } from "./loadFromDatabase";
import { STATS_BACKUP_DIR } from "../consts/constants";

export async function backupStatsFromDatabaseToJSON(): Promise<void> {
  try {
    const stats: Stats | undefined = await loadStatsFromDatabase();
    if (!stats) {
      console.warn("No stats found to backup.");
      return;
    }

    if (!fs.existsSync(STATS_BACKUP_DIR)) {
      fs.mkdirSync(STATS_BACKUP_DIR, { recursive: true });
    }

    const backupFilePath = `${STATS_BACKUP_DIR}stats_backup_${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.json`;
    fs.writeFileSync(backupFilePath, JSON.stringify(stats, null, 2));
  } catch (err: unknown) {
    console.error("Error backing up database stats:", err);
  }
}
