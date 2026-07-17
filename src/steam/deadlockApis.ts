import { SteamApi } from "../../deadlock-ts";
import { Configuration } from "../../deadlock-ts";

const configuration: Configuration = new Configuration();
const steamApiInstance: SteamApi = new SteamApi(configuration);

export function DAPISteam(): SteamApi {
  return steamApiInstance;
}
