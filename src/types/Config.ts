export interface Config {
  aiChannels: [string];

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

  botResponseChance: number;

  stats: {
    messageXPGain: number;
    messageXPGainCooldown: number;
    voiceChatXPGain: number;
    XPPerLevel: number;
  }
}