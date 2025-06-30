import { Client, Guild, TextChannel } from "discord.js";
import configJSON from "../../resources/config.json";
import { Config } from "../types/Config";
import {
  GenericBooleanObject,
  GenericObject,
  GenericStringObject,
} from "../types/Generic";
import { FortniteResponse, FortniteResponseData } from "../types/responses/FortniteResponse";

const config: Config = configJSON;

let currentSongs: string[] = [];
const emoteFlags: GenericBooleanObject = {
  "Bring It Around": false,
  "Get Griddy": false,
};
const emoteMessages: GenericStringObject = {
  "Bring It Around": "**The Homer Simpson dance is now in the Fortnite shop!**",
  "Get Griddy": "**Get Griddy is now in the Fortnite shop!**",
};

async function getFortniteShop(): Promise<FortniteResponseData | undefined> {
  try {
    const response: Response = await fetch("https://fortnite-api.com/v2/shop");
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return undefined;
    }

    const data: FortniteResponse | undefined = await response.json();
    return data?.data;
  } catch (err) {
    console.error("Error fetching Fortnite shop:", err);
    return undefined;
  }
}

function sortSongArray(songA: string, songB: string): number {
  return songA.split(" - ")[1].localeCompare(songB.split(" - ")[1]);
}

export async function checkFortnite(client: Client): Promise<void> {
  const data: FortniteResponseData | undefined = await getFortniteShop();
  if (!data) return;

  const songs: string[] = data.entries
    .filter((entry: GenericObject) => entry.layout.name === "Jam Tracks")
    .map(
      (entry: GenericObject) =>
        `${entry.tracks[0].title} - ${entry.tracks[0].artist}`
    );
  const emotes: string[] = data.entries
    .filter(
      (entry: GenericObject) =>
        entry.brItems && entry.brItems[0].type.value === "emote"
    )
    .map((entry: GenericObject) => entry.brItems[0].name);

  const guild: Guild = await client.guilds.fetch(config.ids.mainGuild);
  const fortniteChannel: TextChannel | null = (await guild.channels.fetch(
    config.ids.fortniteChannel
  )) as TextChannel | null;

  for (const emote in emoteFlags) {
    if (emotes.includes(emote) && !emoteFlags[emote]) {
      emoteFlags[emote] = true;
      fortniteChannel?.send(emoteMessages[emote]);
    } else if (!emotes.includes(emote)) {
      emoteFlags[emote] = false;
    }
  }

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
      fortniteChannel?.send(
        `# Removed Fortnite Jam Tracks\n${oldSongs.join("\n")}`
      );
    }

    if (newSongs.length > 0) {
      fortniteChannel?.send(
        `# New Fortnite Jam Tracks\n${newSongs.join("\n")}`
      );
    }
  }
}
