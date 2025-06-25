import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing required keys");
}

export const keys = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
};
