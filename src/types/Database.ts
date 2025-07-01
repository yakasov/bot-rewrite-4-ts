export interface GuildsStructure {
  guild_id: string;
  allow_responses: boolean;
  rank_up_channel: string;
}

export interface UserStatsStructure {
  id: number;
  guild_id: string;
  user_id: string;
  messages: number;
  voice_time: number;
  join_time: number;
  last_gain_time: number;
  total_experience: number;
  level_experience: number;
  level_value: number;
  score: number;
  name?: string;
  previous_messages?: number;
  previous_voice_time?: number;
}
