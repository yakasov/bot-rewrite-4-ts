export interface Stats {
  [guildId: string]: GuildStats;
}

export interface GuildStats {
  guild: {
    allowResponses: boolean;
    rankUpChannel: string;
  };
  users: {
    [userId: string]: UserStats;
  };
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

export interface StatsEvent {
  guildId: string;
  type:
    | "message"
    | "joinedVoiceChannel"
    | "inVoiceChannel"
    | "leftVoiceChannel";
  userId: string;
}

export interface StatsMessage {
  guildId: string;
  userId: string;
  subject: string;
  accolade: string;
  title: string;
}
