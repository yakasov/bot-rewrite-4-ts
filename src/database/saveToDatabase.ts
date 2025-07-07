import { Pool, PoolConnection } from "mariadb";
import { getDatabasePool } from "./initialiseDatabase";
import { BotContext } from "../types/BotContext";
import { UserStats } from "../types/Stats";
import { GUILD_INSERT_QUERY, USER_INSERT_QUERY } from "./queries";

function isUserStats(obj: any): obj is UserStats {
  return (
    obj && typeof obj === "object" && "messages" in obj && "voiceTime" in obj
  );
}

export async function saveStatsToDatabase(context: BotContext): Promise<void> {
  if (!context.stats || Object.keys(context.stats).length === 0) return;

  const pool: Pool = getDatabasePool();

  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    for (const [guildId, guildData] of Object.entries(context.stats)) {
      await conn.query(GUILD_INSERT_QUERY, [
        guildId,
        guildData.guild.allowResponses,
        guildData.guild.rankUpChannel || "",
      ]);

      for (const [userId, userData] of Object.entries(guildData).filter(
        ([, value]) => isUserStats(value)
      ) as [string, UserStats][]) {
        await conn.query(USER_INSERT_QUERY, [
          guildId,
          userId,
          userData.messages || 0,
          userData.voiceTime || 0,
          userData.joinTime || 0,
          userData.lastGainTime || 0,
          userData.totalXP || 0,
          userData.levelXP || 0,
          userData.level || 0,
          userData.name || "",
          userData.previousMessages || 0,
          userData.previousVoiceTime || 0,
        ]);
      }
    }

    await conn.commit();
  } catch (err: any) {
    if (conn) {
      await conn.rollback();
    }
    console.error("Error saving stats to database:", err);
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}
