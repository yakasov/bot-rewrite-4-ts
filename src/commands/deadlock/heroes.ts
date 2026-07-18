import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DAPIPlayers, getHeroNameFromId } from "../../steam/deadlockApis";
import { GenericNumberObject } from "../../types/Generic";
import deadlockJson from "../../../resources/deadlock.json";
import { HeroStats } from "../../../deadlock-ts";
import { to2DP } from "../../scryfall/helpers/commonHelpers";

export default {
  data: new SlashCommandBuilder()
    .setName("dheroes")
    .setDescription("Get data on your top 5 heroes"),
  async execute(interaction: ChatInputCommandInteraction) {
    const deadlockLinks: GenericNumberObject = deadlockJson;
    const accountId = deadlockLinks[interaction.user.id];

    if (!accountId) {
      await interaction.reply(
        "You need to link your Steam ID using /dlink first!"
      );
      return;
    }

    let heroData: HeroStats[] = await DAPIPlayers()
      .playerHeroStats({
        accountIds: [accountId],
        minUnixTimestamp: 0,
        maxUnixTimestamp: Number.MAX_SAFE_INTEGER,
        minDurationS: 0,
        maxDurationS: 7000,
        minMatchId: 0,
        maxMatchId: Number.MAX_SAFE_INTEGER,
        minNetworth: 0,
        maxNetworth: Number.MAX_SAFE_INTEGER,
        minAverageBadge: 0,
        maxAverageBadge: 116,
      })
      .then((a) => a.data);
    heroData = heroData
      .sort((a, b) => b.time_played - a.time_played)
      .slice(0, 5);

    let message = "## Top 5 Heroes\n\n";

    for (const hero of heroData) {
      message += `### ${await getHeroNameFromId(hero.hero_id)}\n\`\`\`\
Matches Played: ${hero.matches_played}\n\
Kills: ${hero.kills} (${to2DP(hero.kills_per_min)}/m)\n\
Deaths: ${hero.deaths} (${to2DP(hero.deaths_per_min)}/m)\n\
Assists: ${hero.assists} (${to2DP(hero.assists_per_min)}/m)\`\`\`\n`;
    }

    await interaction.reply(message);
  },
};
