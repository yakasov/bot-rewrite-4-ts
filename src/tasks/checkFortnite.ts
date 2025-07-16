import { Client, Guild, TextChannel } from "discord.js";
import {
  GenericBooleanObject,
  GenericObject,
  GenericStringObject,
} from "../types/Generic";
import { FortniteTypes } from "../types/responses/FortniteResponse";
import { URL_FORTNITE_API, URL_FORTNITE_SONGS } from "../consts/constants";
import { BotContext } from "../types/BotContext";

export let currentSongs: string[] = [];
export const emoteFlags: GenericBooleanObject = {
  "Bring It Around": false,
  "Get Griddy": false,
};
export const emoteMessages: GenericStringObject = {
  "Bring It Around": "**The Homer Simpson dance is now in the Fortnite shop!**",
  "Get Griddy": "**Get Griddy is now in the Fortnite shop!**",
};

export async function getFortniteShop(): Promise<
  FortniteTypes.ResponseData | undefined
> {
  try {
    const response: Response = await fetch(URL_FORTNITE_API);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }

    const data: FortniteTypes.Response | undefined = await response.json();
    return data?.data;
  } catch (err: any) {
    console.error("Error fetching Fortnite shop:", err);
    return undefined;
  }
}

export async function getFestivalData(): Promise<
  FortniteTypes.FestivalItem[] | undefined
> {
  try {
    const response: Response = await fetch(URL_FORTNITE_SONGS);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }

    const data: FortniteTypes.FestivalItems | undefined = await response.json();
    return data ? Object.values(data.data) : undefined;
  } catch (err: any) {
    console.error("Error fetching Fortnite Festival data:", err);
    return undefined;
  }
}

export function sortSongArray(songA: string, songB: string): number {
  const [titleA, artistA] = songA.split(" - ");
  const [titleB, artistB] = songB.split(" - ");
  const artistCompare = artistA.localeCompare(artistB);
  if (artistCompare !== 0) return artistCompare;
  return titleA.localeCompare(titleB);
}

export async function checkFortnite(
  client: Client,
  context: BotContext
): Promise<void> {
  const guild: Guild = await client.guilds.fetch(context.config.ids.mainGuild);

  if (!guild) {
    console.error(`Guild not found with ID: ${context.config.ids.mainGuild}`);
    return;
  }

  const fortniteChannel: TextChannel | null = (await guild.channels.fetch(
    context.config.ids.fortniteChannel
  )) as TextChannel | null;

  if (!fortniteChannel || !fortniteChannel.isTextBased()) {
    console.error(
      `Fortnite channel not found or not text-based in guild ${guild.id} (${guild.name})`
    );
    return;
  }

  debugger;

  const data: FortniteTypes.ResponseData | undefined = await getFortniteShop();
  const festivalData: FortniteTypes.FestivalItem[] | undefined =
    await getFestivalData();

  if (data?.entries) {
    const emotes: string[] = data.entries
      .filter(
        (entry: GenericObject) =>
          entry.brItems && entry.brItems[0].type.value === "emote"
      )
      .map((entry: GenericObject) => entry.brItems[0].name);

    for (const emote in emoteFlags) {
      if (emotes.includes(emote) && !emoteFlags[emote]) {
        emoteFlags[emote] = true;
        await fortniteChannel?.send(emoteMessages[emote]);
      } else if (!emotes.includes(emote)) {
        emoteFlags[emote] = false;
      }
    }
  }

  if (festivalData) {
    const songs: string[] = festivalData
      .filter((entry: FortniteTypes.FestivalItem) => entry.featured)
      .map(
        (entry: FortniteTypes.FestivalItem) =>
          `${entry.title} - ${entry.artist}`
      );

    if (currentSongs.length === 0) {
      currentSongs = songs;
      return;
    }

    const newSongs: string[] = songs.filter(
      (song: string) => !currentSongs.includes(song)
    );
    const oldSongs: string[] = currentSongs.filter(
      (song: string) => !songs.includes(song)
    );

    newSongs.sort(sortSongArray);
    oldSongs.sort(sortSongArray);

    if (newSongs.length > 0 || oldSongs.length > 0) {
      currentSongs = songs;
      if (oldSongs.length > 0) {
        await fortniteChannel?.send(
          `# Removed Fortnite Jam Tracks\n${oldSongs.join("\n")}`
        );
      }

      if (newSongs.length > 0) {
        await fortniteChannel?.send(
          `# New Fortnite Jam Tracks\n${newSongs.join("\n")}`
        );
      }
    }
  }
}
