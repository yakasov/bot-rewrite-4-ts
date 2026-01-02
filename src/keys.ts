import dotenv from "dotenv";

dotenv.config();

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_DB,
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OPENAI_TOKEN,
  GOOGLE_BOOKS_TOKEN,
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing required Discord keys");
}

export const DATABASE_KEYS_PRESENT =
  DATABASE_HOST &&
  DATABASE_PORT &&
  DATABASE_USER &&
  DATABASE_PASSWORD &&
  DATABASE_DB;

if (!DATABASE_KEYS_PRESENT) {
  console.error(
    "Missing database configuration keys, stats will not be active."
  );
}

export const KEYS = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OPENAI_TOKEN,
  GOOGLE_BOOKS_TOKEN,
};

export const DATABASE = {
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT ?? "3306", 10),
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_DB,
};
