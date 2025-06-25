export interface Stats {
  achievementTracking: { [key: string]: number };
  achievements: [string];
  customSetName: boolean;
  joinTime: number;
  lastGainTime: number;
  level: number;
  levelXP: number;
  messages: number;
  name: string;
  totalXP: number;
  unlockedNames: [string];
  voiceTime: number;
}