import { Pool, PoolConnection } from "mariadb";
import { getDatabasePool } from "./initialiseDatabase";
import { guildSelectQuery, userSelectQuery } from "./queries";
import { Stats } from "../types/Stats";
import { GuildsStructure, UserStatsStructure } from "../types/Database";

export async function loadStatsFromDatabase(): Promise<Stats | undefined> {
  const pool: Pool = getDatabasePool();

  let conn: PoolConnection | null = null;
  try {
    conn = await pool.getConnection();

    const guilds: GuildsStructure[] = await conn.query(guildSelectQuery);
    const stats: Stats = {};

    for (const guild of guilds) {
      stats[guild.guild_id].guild = {
        allowResponses: guild.allow_responses,
        rankUpChannel: guild.rank_up_channel,
      };
    }

    const userStats: UserStatsStructure[] = await conn.query(userSelectQuery);

    for (const userStat of userStats) {
      if (!stats[userStat.guild_id]) {
        stats[userStat.guild_id].guild = {
          allowResponses: true,
          rankUpChannel: "",
        };
      }

      stats[userStat.guild_id].users[userStat.user_id] = {
        joinTime: userStat.join_time,
        lastGainTime: userStat.last_gain_time,
        level: userStat.level_value,
        levelXP: userStat.level_experience,
        messages: userStat.messages,
        name: userStat.name || "",
        previousMessages: userStat.previous_messages || 0,
        previousVoiceTime: userStat.previous_voice_time || 0,
        totalXP: userStat.total_experience,
        voiceTime: userStat.voice_time,
      };
    }

    return stats;
  } catch (err: any) {
    console.error("Error loading stats from database:", err);
    return undefined;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}
