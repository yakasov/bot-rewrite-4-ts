import { PlayersApi } from "../../deadlock-ts";
import { SteamApi } from "../../deadlock-ts";
import { Configuration } from "../../deadlock-ts";

const configuration: Configuration = new Configuration();
const steamApiInstance: SteamApi = new SteamApi(configuration);
const playersApiInstance: PlayersApi = new PlayersApi(configuration);

export function DAPISteam(): SteamApi {
  return steamApiInstance;
}

export function DAPIPlayers(): PlayersApi {
  return playersApiInstance;
}
