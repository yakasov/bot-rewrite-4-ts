export const AI_DEFAULT_TEMP: number = 0.9;
export const AI_MAX_TOKENS: number = 4096;
export const AI_MODEL: string = "gpt-4o-mini";
export const AI_REQUEST_ATTEMPTS: number = 3;

export const BASIC_JSON_FILES: string[] = [
  "./resources/birthdays.json",
  "./resources/chanceResponses.json",
  "./resources/mtg/mtgCache.json",
  "./resources/mtg/mtgCards.json",
  "./resources/stats.json",
  "./resources/ranks.json",
  "./resources/roles.json",
];

export const DISCORD_ID_LENGTH: number = 18;
export const DISCORD_VOICE_CHANNEL_TYPE: number = 2;

export const MTG_PACK_SIZE: number = 12;

export const REGEX_DISCORD_MESSAGE_LENGTH: RegExp = /[\s\S]{1,2000}(?!\S)/gu;
export const REGEX_DISCORD_MESSAGE_LENGTH_SHORT: RegExp =
  /[\s\S]{1,1980}(?!\S)/gu;
export const REGEX_SANITIZE_STRING: RegExp = /[^\x00-\x7F]/gu;
export const REGEX_SCRYFALL_PATTERN: RegExp =
  /\[\[(?<card>[^|\]]+?)(?:\|{1,2}(?<set>[^\]]+))?\]\]/gu;
export const REGEX_STEAM_LINK: RegExp = /https:\/\/steamcommunity\.com\S*/gu;
export const REGEX_TIME_MATCH: RegExp = /\b\d+\s*:\s*\d+\b/gu;
export const REGEX_YOUTUBE_URL_FULL: RegExp =
  /^https?:\/\/(?<subdomain>www\.)?youtube\.com\/watch\?v=/gu;
export const REGEX_YOUTUBE_URL_SHORT: RegExp = /^https?:\/\/youtu\.be\//gu;

export const STEAM_URL_LINK: string =
  "https://yakasov.github.io/pages/miscellaneous/steam_direct.html?page=";

export const THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF: string = "135410033524604928";

export const TWITTER_LINKS: string[] = [
  "https://x.com/",
  "https://twitter.com/",
];

export const STATS_BACKUP_DIR: string = "./backups/";
export const STATS_TOP_SCORES_N: number = 10;

export const YT_MAX_AUDIO_SIZE: number = 33554432;
