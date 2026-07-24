import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DAPIAnalytics, getHeroNameFromId } from "../../steam/deadlockApis";
import { HeroBanStats } from "../../../deadlock-ts";
import { wrapCodeBlockString } from "../../util/commonFunctions";

interface NeatBanData {
  heroName: string;
  bans: number;
}

export default {
  data: new SlashCommandBuilder()
    .setName("dbans")
    .setDescription("Get ban data from the last 30 days"),
  async execute(interaction: ChatInputCommandInteraction) {
    const banData: HeroBanStats[] = await DAPIAnalytics()
      .heroBanStats()
      .then((a) => a.data);
    const neatBanData: NeatBanData[] = await Promise.all(
      banData.map(async (d) => ({
        heroName: await getHeroNameFromId(d.hero_id),
        bans: d.bans,
      }))
    );
    neatBanData.sort((a, b) => b.bans - a.bans);

    const totalBans: number = neatBanData.reduce((s, a) => s + a.bans, 0);
    const percentFn = (n: number): number =>
      Math.round((n * 1000) / totalBans) / 10;
    const padStrings = (d: NeatBanData): string =>
      `${d.heroName.padEnd(11)}: ${d.bans.toString().padStart(5)} (${percentFn(d.bans)}%)`;
    const top10Bans: string = neatBanData
      .slice(0, 10)
      .map(padStrings)
      .join("\n");
    const bottom5Bans: string = neatBanData
      .slice(-5)
      .map(padStrings)
      .join("\n");

    const message = `\
## Ban statistics in the last 30 days\n\n\
### Top 10\n${wrapCodeBlockString(top10Bans)}\n\
### Bottom 5\n${wrapCodeBlockString(bottom5Bans)}`;

    await interaction.reply(message);
  },
};
