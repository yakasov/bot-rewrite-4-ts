export interface Stats {
  [guildId: string]: GuildStats;
}

export interface GuildStats {
  allowResponses: boolean;
  rankUpChannel: string;
  [userId: string]: UserStats | boolean | string;
}

export interface UserStats {
  joinTime: number;
  lastGainTime: number;
  level: number;
  levelXP: number;
  messages: number;
  previousMessages?: number;
  previousVoiceTime?: number;
  name: string;
  totalXP: number;
  voiceTime: number;
}
