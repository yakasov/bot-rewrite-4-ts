export interface BulkMetadata {
  // Only accurate with the following options:
  // includeInfo: true;
  // includeMoreInfo: true;
  // includePlayerInfo: true;
  // includePlayerFinalStats: true;
  match_id: number;
  start_time: string;
  winning_team: string;
  duration_s: number;
  match_outcome: string;
  match_mode: string;
  game_mode: string;
  average_badge_team0: number;
  average_badge_team1: number;
  not_scored: boolean;
  rewards_eligible: boolean;
  is_high_skill_range_parties: boolean;
  low_pri_pool: boolean;
  new_player_pool: boolean;
  team_score: unknown[];
  match_tracked_stats: TrackedStats;
  team0_tracked_stats: TrackedStats;
  team1_tracked_stats: TrackedStats;
  players: Player[];
  banned_hero_ids: unknown[];
}

export interface Player {
  abandon_match_time_s: number;
  ability_points: number;
  accolades: PlayerAccolade[];
  account_id: number;
  assigned_lane: number;
  assists: number;
  deaths: number;
  denies: number;
  final_stats: FinalStats;
  hero_build_id: number;
  hero_id: number;
  kills: number;
  last_hits: number;
  net_worth: number;
  player_level: number;
  player_slot: number;
  team: string;
}

export interface PlayerAccolade {
  accolade_id: number;
  accolade_stat_value: number;
  accolade_threshold_achieved: number;
}

interface FinalStats {
  ability_kills: number;
  ability_points: number;
  absorption_provided: number;
  assists: number;
  boss_damage: number;
  bullet_kills: number;
  creep_damage: number;
  creep_kills: number;
  damage_absorbed: number;
  damage_mitigated: number;
  deaths: number;
  denies: number;
  gold_boss: number;
  gold_boss_orb: number;
  gold_death_loss: number;
  gold_denied: number;
  gold_lane_creep: number;
  gold_lane_creep_orbs: number;
  gold_neutral_creep: number;
  gold_neutral_creep_orbs: number;
  gold_player: number;
  gold_player_orbs: number;
  gold_treasure: number;
  headshot_kills: number;
  heal_lost: number;
  heal_prevented: number;
  hero_bullets_hit: number;
  hero_bullets_hit_crit: number;
  kills: number;
  level: number;
  max_health: number;
  melee_kills: number;
  net_worth: number;
  neutral_damage: number;
  neutral_kills: number;
  player_barriering: number;
  player_damage: number;
  player_damage_taken: number;
  player_healing: number;
  possible_creeps: number;
  self_damage: number;
  self_healing: number;
  shots_hit: number;
  shots_missed: number;
  teammate_barriering: number;
  teammate_healing: number;
  tech_power: number;
  time_stamp_s: number;
  weapon_power: number;
}

export interface NeatBanData {
  heroName: string;
  bans: number;
}
