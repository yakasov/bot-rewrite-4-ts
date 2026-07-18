import { AnalyticsApi, Hero, HeroesApi, PlayersApi } from "../../deadlock-ts";
import { SteamApi } from "../../deadlock-ts";
import { Configuration } from "../../deadlock-ts";

const configuration: Configuration = new Configuration();
const analyticsApiInstance: AnalyticsApi = new AnalyticsApi(configuration);
const heroesApiInstance: HeroesApi = new HeroesApi(configuration);
const steamApiInstance: SteamApi = new SteamApi(configuration);
const playersApiInstance: PlayersApi = new PlayersApi(configuration);

const heroIds: Record<number, string> = {};

export function DAPIAnalytics(): AnalyticsApi {
  return analyticsApiInstance;
}

export function DAPIHeroes(): HeroesApi {
  return heroesApiInstance;
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
