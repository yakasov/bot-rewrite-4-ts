import { BorderColor } from "scryfall-api";

export const AI_DEFAULT_TEMP = 0.9;
export const AI_MAX_TOKENS = 4096;
export const AI_MODEL = "gpt-4o-mini";
export const AI_REQUEST_ATTEMPTS = 3;

export const BASIC_JSON_FILES: string[] = [
  "./resources/birthdays.json",
  "./resources/chanceResponses.json",
  "./resources/mtg/mtgCache.json",
  "./resources/mtg/mtgCards.json",
  "./resources/stats.json",
  "./resources/ranks.json",
  "./resources/roles.json",
];

export const BOOKS_DESCRIPTION_ERROR =
  "The description is so unbelievably, undeniably fucked. This should never happen, oops";
export const BOOKS_GOODREADS_SEARCH_URL =
  "https://www.goodreads.com/search?utf8=✓&query=";
export const BOOKS_INVALID_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png?20250720084638";
export const BOOKS_SEARCH_GOOGLE_URL =
  "https://www.googleapis.com/books/v1/volumes?q=";
export const BOOKS_SEARCH_OPENLIBRARY_URL =
  "https://openlibrary.org/search.json?q=";

export const DISCORD_ID_LENGTH = 18;
export const DISCORD_VOICE_CHANNEL_TYPE = 2;

export const MTG_PACK_SIZE = 12;

export const REGEX_BOOKS_PATTERN =
  /\{\{\s*(?<name>[^|}]+?)\s*(?:\|\s*(?<author>[^}]+?)\s*)?\}\}/gu;
export const REGEX_DISCORD_MESSAGE_LENGTH = /[\s\S]{1,2000}(?!\S)/gu;
export const REGEX_DISCORD_MESSAGE_LENGTH_SHORT = /[\s\S]{1,1980}(?!\S)/gu;
export const REGEX_GOODREADS_DATA_PATTERN =
  /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/gu;
export const REGEX_GOODREADS_IMAGE_PATTERN =
  /(images\/S\/compressed\.photo\.goodreads\.com\/books\/\d+i\/\d+)/gu;
export const REGEX_SANITIZE_STRING = /[^\x00-\x7F]/gu;
export const REGEX_SCRYFALL_EDHREC_PATTERN = /[^ a-zA-Z0-9]/gu;
export const REGEX_SCRYFALL_PATTERN =
  /\[\[\s*(?<card>[^|\]]*?)\s*(?:\|\s*(?<set>[^|\]]*?))?(?:\|\s*(?<number>[^|\]]+?))?\s*\]\]/gu;
export const REGEX_STEAM_LINK = /https:\/\/steamcommunity\.com\S*/gu;
export const REGEX_TIME_MATCH = /\b\d+\s*:\s*\d+\b/gu;
export const REGEX_YOUTUBE_URL_FULL =
  /^https?:\/\/(?<subdomain>www\.)?youtube\.com\/watch\?v=*/gu;
export const REGEX_YOUTUBE_URL_SHORT = /^https?:\/\/youtu\.be\/*/gu;

export const SCRYFALL_BANNED_QUERY =
  "https://api.scryfall.com/cards/search?q=banned%3Acommander";
export const SCRYFALL_DEFAULT_QUERY =
  "https://api.scryfall.com/cards/search?q=order%3Aedhrec+game%3Apaper+direction%3Adesc+legal%3Acommander+-s%3Aunf+-s%3Asunf+-type%3Abasic+-is%3Ameld+&unique=cards&as=grid&order=name";
export const SCRYFALL_DEFAULT_COMMANDER_QUERY =
  "https://api.scryfall.com/cards/search?q=legal%3Acommander+is%3Acommander";
export const SCRYFALL_DEFAULT_COMMANDER_LEGAL_QUERY =
  "https://api.scryfall.com/cards/search?q=legal%3Acommander";
export const SCRYFALL_EDHREC_API_SEARCH =
  "https://json.edhrec.com/pages/cards/<<REPLACE>>.json";
export const SCRYFALL_EDHREC_API_COMMANDER_SEARCH =
  "https://json.edhrec.com/pages/commanders/<<REPLACE>>.json";
export const SCRYFALL_EDHREC_SEARCH = "https://edhrec.com/cards/";
export const SCRYFALL_HEX_COLOR_CODES: Record<BorderColor, number> = {
  // "black": 0x000000,
  black: 0x4c4d53, // Black looks a bit ugly so using default colour
  borderless: 0x4c4d53,
  gold: 0xaa8c55,
  silver: 0xa5afb6,
  white: 0xffffff,
};
export const SCRYFALL_MINOR_SPELLING_MISTAKE_STRINGS: string[] = [
  "[[minor spelling mistake]]",
  "[[msm]]",
];
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
export const SCRYFALL_PRINTINGS_SEARCH =
  "https://scryfall.com/search?as=grid&order=released&q=%21%22<<REPLACE>>%22+include%3Aextras&unique=prints";
export const SCRYFALL_SET_IMAGES_PATH = "./resources/scryfall/sets";
export const SCRYFALL_SPELLBOOK_URL =
  "https://commanderspellbook.com/search/?q=";
export const SCRYFALL_SYNTAX_PREFIX = "order:edhrec game:paper ";

export const STEAM_URL_LINK =
  "https://yakasov.github.io/util/steam_direct.html?page=";

export const THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF = "135410033524604928";
export const THIS_ID_IS_A_PINGING_BOZO = "214404843442274304";

export const TWITTER_LINKS: Record<string, RegExp> = {
  "https://fixupx.com/": /https:\/\/x\.com\//u,
  "https://fxtwitter.com/": /https:\/\/twitter\.com\//u,
};

export const STATS_BACKUP_DIR = "./backups/";
export const STATS_TOP_SCORES_N = 10;

export const URL_API_RULES = "https://jmcd.uk/bot/getRules";
export const URL_FORTNITE_API = "https://fortnite-api.com/v2/shop";
export const URL_FORTNITE_SONGS =
  "https://raw.githubusercontent.com/FNFestival/fnfestival.github.io/refs/heads/main/data/jam_tracks.json";
export const URL_MINECRAFT_STATUS = "https://api.mcstatus.io/v2/status/java";
export const URL_SCRYFALL_ORACLE =
  "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A<<ORACLE_ID>>&unique=prints";
export const URL_TTS_API =
  "https://tiktok-tts.weilnet.workers.dev/api/generation";

export const YT_MAX_AUDIO_SIZE = 33554432;
