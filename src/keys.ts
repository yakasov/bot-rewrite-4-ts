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
  OPENAI_TOKEN
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing required keys");
}

if (
  !DATABASE_HOST ||
  !DATABASE_PORT ||
  !DATABASE_USER ||
  !DATABASE_PASSWORD ||
  !DATABASE_DB
) {
  console.error(
    "Missing database configuration keys, stats will not be active."
  );
}

export const keys = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OPENAI_TOKEN
};

export const database = {
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT ?? "3306", 10),
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_DB,
};
