import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { GenericNumberObject } from "../../types/Generic";
import deadlockJson from "../../../resources/deadlock.json";
import { DAPIPlayers, getHeroNameFromId } from "../../steam/deadlockApis";
import { PlayerMatchHistoryEntry } from "../../../deadlock-ts";
import { wrapCodeBlockString } from "../../util/commonFunctions";

export default {
  data: new SlashCommandBuilder()
    .setName("dhistory")
    .setDescription("Get recent match history"),
  async execute(interaction: ChatInputCommandInteraction) {
    const deadlockLinks: GenericNumberObject = deadlockJson;
    const accountId: number = deadlockLinks[interaction.user.id];

    if (!accountId) {
      await interaction.reply("Link your account via /dlink first!");
      return;
    }

    const matchData: PlayerMatchHistoryEntry[] = await DAPIPlayers()
      .matchHistory({ accountId })
      .then((a) => a.data);
    const tenRecentMatches: PlayerMatchHistoryEntry[] = matchData.slice(0, 10);

    const header = `${"Match ID".padEnd(10)} ${"Hero".padEnd(12)}  ${"Start Time".padEnd(20)}  Kills  Deaths  Assists  Won`;
    const headerBar: string = "-".padEnd(header.length, "-");
    const rows = await Promise.all(
      tenRecentMatches.map(async (m) => {
        const heroName = await getHeroNameFromId(m.hero_id);

        return `${m.match_id.toString().padEnd(10)} ${heroName.padEnd(
          12
        )}  ${new Date(m.start_time * 1000).toLocaleString("en-GB")}  ${m.player_kills
          .toString()
          .padStart(5)}  ${m.player_deaths
          .toString()
          .padStart(6)}  ${m.player_assists.toString().padStart(7)}  ${
          m.match_result === 1 ? "Yes" : "No "
        }`;
      })
    );

    const tableString = `${header}
${headerBar}
${rows.join("\n")}`;

    await interaction.reply(wrapCodeBlockString(tableString));
  },
};
