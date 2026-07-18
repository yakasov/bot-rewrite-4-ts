import fs from "fs";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import deadlockJson from "../../../resources/deadlock.json";
import { GenericNumberObject } from "../../types/Generic";
import { DAPISteam } from "../../steam/deadlockApis";
import { SteamProfile } from "../../../deadlock-ts";
import { getSearchURL } from "../../steam/webApi";
import { ResolveVanityURL, WebAPIResponse } from "../../types/steam/WebAPI";

async function getAccountID(query: string): Promise<SteamProfile> {
  const profile: SteamProfile = await DAPISteam()
    .steamSearch({
      searchQuery: query,
    })
    .then((a) => a.data[0]);
  return profile;
}

export default {
  data: new SlashCommandBuilder()
    .setName("dlink")
    .setDescription("Link your Steam account for Deadlock commands")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("id")
        .setDescription("Your Steam ID (in any format)")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const idString: string = interaction.options.getString("id") ?? "";
    const deadlockLinks: GenericNumberObject = deadlockJson;

    if (idString.length === 17) {
      const profile: SteamProfile = await getAccountID(idString);
      deadlockLinks[interaction.user.id] = profile.account_id;
    } else {
      const searchUrl: string = getSearchURL(idString);
      const response: WebAPIResponse<ResolveVanityURL> = await fetch(
        searchUrl
      ).then((res) => res.json());

      if (response.response.steamid) {
        const profile: SteamProfile = await getAccountID(
          response.response.steamid
        );
        deadlockLinks[interaction.user.id] = profile.account_id;
      }
    }

    fs.writeFileSync(
      "./resources/deadlock.json",
      JSON.stringify(deadlockLinks)
    );

    await interaction.reply(
      `Link user ${interaction.user.id} is set to ${deadlockLinks[interaction.user.id]}!`
    );
  },
};
