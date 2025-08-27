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

export const BOOKS_GOODREADS_SEARCH_URL: string =
  "https://www.goodreads.com/search?utf8=✓&query=";
export const BOOKS_INVALID_IMAGE_URL: string =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png?20250720084638";
export const BOOKS_SEARCH_GOOGLE_URL: string =
  "https://www.googleapis.com/books/v1/volumes?q=";
export const BOOKS_SEARCH_OPENLIBRARY_URL: string =
  "https://openlibrary.org/search.json?q=";

export const DISCORD_ID_LENGTH: number = 18;
export const DISCORD_VOICE_CHANNEL_TYPE: number = 2;

export const MTG_PACK_SIZE: number = 12;

export const REGEX_BOOKS_PATTERN: RegExp =
  /\{\{\s*(?<name>[^|}]+?)\s*(?:\|\s*(?<author>[^}]+?)\s*)?\}\}/gu;
export const REGEX_DISCORD_MESSAGE_LENGTH: RegExp = /[\s\S]{1,2000}(?!\S)/gu;
export const REGEX_DISCORD_MESSAGE_LENGTH_SHORT: RegExp =
  /[\s\S]{1,1980}(?!\S)/gu;
export const REGEX_SANITIZE_STRING: RegExp = /[^\x00-\x7F]/gu;
export const REGEX_SCRYFALL_PATTERN: RegExp =
  /\[\[(?<card>[^|\]]+?)(?:\s*\|\s*(?<set>[^|\]]+?)(?:\s*\|\s*(?<number>[^|\]]+?))?)?\]\]/gu;
export const REGEX_STEAM_LINK: RegExp = /https:\/\/steamcommunity\.com\S*/gu;
export const REGEX_TIME_MATCH: RegExp = /\b\d+\s*:\s*\d+\b/gu;
export const REGEX_YOUTUBE_URL_FULL: RegExp =
  /^https?:\/\/(?<subdomain>www\.)?youtube\.com\/watch\?v=*/gu;
export const REGEX_YOUTUBE_URL_SHORT: RegExp = /^https?:\/\/youtu\.be\/*/gu;

export const SCRYFALL_MINOR_SPELLING_MISTAKE_STRING: string =
  "[[minor spelling mistake]]";
export const SCRYFALL_MINOR_SPELLING_MISTAKE_RESPONSES: string[] = [
  "https://tenor.com/view/minor-spelling-mistake-dream-dream-youtuber-gif-13914252076385141995",
  "https://tenor.com/view/minor-spelling-mistake-spelling-mistake-gif-4898195786185830013",
  "https://tenor.com/view/minor-spelling-mistake-badlands-loaded-weapon-gif-9983525449026664198",
  "https://tenor.com/view/minor-spelling-mistake-gojo-satoru-gojo-gojo-fortnite-jjk-gif-17042212247732787418",
  "https://tenor.com/view/minor-spelling-mistake-skeleton-skeleton-dies-gif-22412591",
  "https://tenor.com/view/ultra-instinct-goku-minor-spelling-mistake-aura-gif-535268994186034537",
  "https://tenor.com/view/minor-spelling-mistake-minor-spelling-mistake-i-win-minor-spelling-mistake-i-win-meme-shadow-the-hedgehog-shadow-gif-26138585",
  "https://tenor.com/view/goku-freeza-frieza-dbz-minor-spelling-mistake-gif-22504422",
  "https://tenor.com/view/minor-spelling-mistake-thanos-thanos-snap-dust-gif-16037423944121739362",
  "https://tenor.com/view/spelling-mistake-minor-spelling-mistake-meme-gif-23650588",
  "https://tenor.com/view/patrick-star-minor-s-spongebob-spongebob-meme-spongebob-squarepants-gif-10940848928744248792",
  "https://tenor.com/view/minor-spelling-mistake-gif-21179057",
];

export const STEAM_URL_LINK: string =
  "https://yakasov.github.io/pages/miscellaneous/steam_direct.html?page=";

export const THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF: string = "135410033524604928";

export const TWITTER_LINKS: { [key: string]: RegExp } = {
  "https://fixupx.com/": /https:\/\/x\.com\//u,
  "https://fxtwitter.com/": /https:\/\/twitter\.com\//u,
};

export const STATS_BACKUP_DIR: string = "./backups/";
export const STATS_TOP_SCORES_N: number = 10;

export const URL_API_RULES: string = "https://jmcd.uk/bot/getRules";
export const URL_FORTNITE_API: string = "https://fortnite-api.com/v2/shop";
export const URL_FORTNITE_SONGS: string =
  "https://raw.githubusercontent.com/FNFestival/fnfestival.github.io/refs/heads/main/data/jam_tracks.json";
export const URL_MINECRAFT_STATUS: string =
  "https://api.mcstatus.io/v2/status/java";
export const URL_SCRYFALL_ORACLE: string =
  "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A<<ORACLE_ID>>&unique=prints";
export const URL_TTS_API: string =
  "https://tiktok-tts.weilnet.workers.dev/api/generation";

export const YT_MAX_AUDIO_SIZE: number = 33554432;
