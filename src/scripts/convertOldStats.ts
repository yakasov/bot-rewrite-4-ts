import fs from "fs";
import path from "path";
import { Stats, GuildStats, UserStats } from "../types/Stats";

interface OldStats {
  [guildId: string]: OldGuildStats;
}

interface OldGuildStats {
  allowResponses: boolean;
  rankUpChannel: string;
  [userId: string]: UserStats | boolean | string;
}

export async function convertOldStats(): Promise<void> {
  const statsPath = path.join(process.cwd(), "resources", "stats.json");

  if (!fs.existsSync(statsPath)) {
    console.log("No stats.json file found in resources folder");
    return;
  }

  try {
    const oldStatsData = fs.readFileSync(statsPath, "utf-8");
    const oldStats: OldStats = JSON.parse(oldStatsData);
    const newStats: Stats = {};

    for (const [guildId, oldGuildData] of Object.entries(oldStats)) {
      const newGuildStats: GuildStats = {
        guild: {
          allowResponses: oldGuildData.allowResponses,
          rankUpChannel: oldGuildData.rankUpChannel,
        },
        users: {},
      };

      for (const [key, value] of Object.entries(oldGuildData)) {
        if (
          key !== "allowResponses" &&
          key !== "rankUpChannel" &&
          key.length === 18
        ) {
          if (typeof value === "object" && value !== null) {
            newGuildStats.users[key] = value as UserStats;
          }
        }
      }

      newStats[guildId] = newGuildStats;
    }

    const backupPath = path.join(
      process.cwd(),
      "resources",
      "stats.json.backup"
    );
    fs.copyFileSync(statsPath, backupPath);
    console.log(`Backup created at: ${backupPath}`);

    fs.writeFileSync(statsPath, JSON.stringify(newStats, null, 2), "utf-8");

    const totalGuilds = Object.keys(newStats).length;
    const totalUsers = Object.values(newStats).reduce(
      (sum, guild) => sum + Object.keys(guild.users).length,
      0
    );
    console.log(
      `Converted ${totalGuilds} guilds with ${totalUsers} total users`
    );
  } catch (error) {
    console.error("Error converting stats:", error);
    throw error;
  }
}

if (require.main === module) {
  (async () => {
    try {
      await convertOldStats();
      process.exit(0);
    } catch (error) {
      console.error("Conversion failed:", error);
      process.exit(1);
    }
  })();
}
