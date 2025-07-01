import fs from "node:fs";
import moment from "moment-timezone";
import { Stats } from "../types/Stats";
import { loadStatsFromDatabase } from "./loadFromDatabase";
import { STATS_BACKUP_DIR } from "../consts/constants";

export async function backupStatsFromDatabaseToJSON(): Promise<void> {
  try {
    const stats: Stats = await loadStatsFromDatabase();

    if (!fs.existsSync(STATS_BACKUP_DIR)) {
      fs.mkdirSync(STATS_BACKUP_DIR, { recursive: true });
    }

    const backupFilePath: string = `${STATS_BACKUP_DIR}stats_backup_${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.json`;
    fs.writeFileSync(backupFilePath, JSON.stringify(stats, null, 2));
  } catch (err: any) {
    console.error("Error backing up database stats:", err);
  }
}
