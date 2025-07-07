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
  [key: string]: number | string | undefined;
}

export interface StatsEvent {
  guildId: string;
  type:
    | "message"
    | "joinedVoiceChannel"
    | "inVoiceChannel"
    | "leftVoiceChannel"
    | "guildInit";
  userId: string;
}

export interface StatsMessage {
  guildId: string;
  userId: string;
  subject: string;
  accolade: string;
  title: string;
}

export interface TableData {
  "#": number;
  Name: string | undefined;
  Level: string;
  Msgs: number;
  "Voice Time": string;
  Title: string;
  [key: string]: string | number | undefined;
}
