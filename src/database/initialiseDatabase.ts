import mariadb, { Pool } from "mariadb";
import { database } from "../keys";
import { guildCreateQuery, userCreateQuery } from "./queries";

let pool: Pool | null = null;

export function initialiseDatabase(): void {
  if (pool) return;

  try {
    pool = mariadb.createPool({
      host: database.host,
      port: database.port,
      user: database.user,
      password: database.password,
      database: database.database,
      connectionLimit: 5,
      acquireTimeout: 10000,
    });

    console.log("Successfully created database pool.");
  } catch (err: any) {
    console.error("Failed to create database pool:", err);
    throw err;
  }
}

export async function createTables(): Promise<void> {
  if (!pool) {
    initialiseDatabase();
    return;
  }

  let conn: mariadb.PoolConnection | null = null;
  try {
    conn = await pool.getConnection();

    await conn.query(guildCreateQuery);
    await conn.query(userCreateQuery);

    console.log("Database tables created/verified successfully");
  } catch (err: any) {
    console.error("Error creating database tables:", err);
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

export function getDatabasePool(): mariadb.Pool {
  if (!pool) {
    initialiseDatabase();
  }
  return pool!;
}
