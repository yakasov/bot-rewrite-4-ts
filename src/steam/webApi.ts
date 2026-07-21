import { KEYS } from "../keys";

const searchUrl = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?";

export function getSearchURL(query: string) {
  const params = new URLSearchParams({
    key: KEYS.STEAM_API_KEY ?? "",
    vanityUrl: query
  });
  return `${searchUrl}${params.toString()}`;
}