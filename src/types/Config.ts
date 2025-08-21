export interface Config {
  bot: {
    aiChannels: string[];

    allowResponses: boolean;
    responseChance: number;
  },

  fortnite: {
    checkEmotes: boolean;
    checkSongs: boolean;
  }

  ids: {
    mainGuild: string;
    birthdayChannel: string;
    birthdayRole: string;
    fortniteChannel: string;
  }

  minecraft: {
    serverIp: string;
    serverPort: number;
    serverOwnerId: string;
  }

  stats: {
    messageXPGain: number;
    messageXPGainCooldown: number;
    voiceChatXPGain: number;
    XPPerLevel: number;
  }
}