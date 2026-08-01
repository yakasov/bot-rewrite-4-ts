/**
 * Interface for config.json. This is separate from .env!
 */
export interface Config {
  bot: {
    /** Channels where AI commands are permitted. */
    aiChannels: string[];

    /** Whether auto responses are enabled. */
    allowResponses: boolean;

    /** The chance as a percentage for any given message to get a response. */
    responseChance: number;
  },

  fortnite?: {
    /** Whether to check for specific emotes, and then to send a message regarding them. */
    checkEmotes?: boolean;

    /** Whether to check for new Jam Tracks, and then to send a message regarding them. */
    checkSongs?: boolean;
  }

  /** Discord technical IDs of length 18 */
  ids: {
    deadlockChannel: string;
    mainGuild: string;
    birthdayChannel: string;
    birthdayRole: string;
    fortniteChannel: string;
  }

  minecraft: {
    serverIp: string;
    serverPort: number;

    /** @deprecated Used to ping the Minecraft server owner if the server goes down */
    serverOwnerId: string;
  }

  stats: {
    /** XP gain per message sent. */
    messageXPGain: number;

    /** The time in seconds that must pass before XP can be gained from another message. */
    messageXPGainCooldown: number;

    /** XP gain per second in voice chat. */
    voiceChatXPGain: number;

    /** Base XP per level. */
    XPPerLevel: number;
  }
}