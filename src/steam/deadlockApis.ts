import {
  AnalyticsApi,
  Hero,
  HeroesApi,
  InternalApi,
  MatchesApi,
  PlayersApi,
} from "../../deadlock-ts";
import { SteamApi } from "../../deadlock-ts";
import { Configuration } from "../../deadlock-ts";

const configuration: Configuration = new Configuration();
const analyticsApiInstance: AnalyticsApi = new AnalyticsApi(configuration);
const heroesApiInstance: HeroesApi = new HeroesApi(configuration);
const internalApiInstance: InternalApi = new InternalApi(configuration);
const matchesApiInstance: MatchesApi = new MatchesApi(configuration);
const steamApiInstance: SteamApi = new SteamApi(configuration);
const playersApiInstance: PlayersApi = new PlayersApi(configuration);

const heroIds: Record<number, string> = {};

export function DAPIAnalytics(): AnalyticsApi {
  return analyticsApiInstance;
}

export function DAPIHeroes(): HeroesApi {
  return heroesApiInstance;
}

export function DAPIInternal(): InternalApi {
  return internalApiInstance;
}

export function DAPIMatches(): MatchesApi {
  return matchesApiInstance;
}

export function DAPISteam(): SteamApi {
  return steamApiInstance;
}

export function DAPIPlayers(): PlayersApi {
  return playersApiInstance;
}

export async function getHeroNameFromId(id: number) {
  if (Object.keys(heroIds).length === 0) {
    await DAPIHeroes()
      .listHeroes()
      .then((a) => a.data)
      .then((hs: Hero[]) => hs.map((h) => (heroIds[h.id] = h.name)));
  }

  return heroIds[id];
}

export function getAccoladeNameFromId(id: number): string {
  return ACCOLADE_NAMES[id];
}

const ACCOLADE_NAMES: Record<number, string> = {
  1: "Kills",
  2: "Assists",
  3: "Healing",
  4: "Player Damage",
  5: "Net Worth",
  6: "Trooper Last Hits",
  7: "Neutral Last Hits",
  8: "Last Hits",
  9: "Secures",
  10: "Denies",
  11: "Breakables Destroyed",
  12: "Pickups Collected",
  13: "Urns Returned",
  14: "Sinner Jackpots Achieved",
  15: "First Blood",
  16: "Killstreak Kills",
  17: "Short Distance Kills",
  18: "Long Distance Kills",
  19: "Gun Kills",
  20: "Melee Kills",
  21: "Ability Kills",
  22: "Bullet Damage",
  23: "Melee Damage",
  24: "Ability Damage",
  25: "Weapon Damage",
  26: "Damage Absorbed",
  27: "Damage Mitigated",
  28: "Headshots",
  29: "Headshot Damage",
  30: "Short Distance Damage",
  31: "Long Distance Damage",
};
