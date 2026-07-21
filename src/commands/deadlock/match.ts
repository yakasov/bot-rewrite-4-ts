import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
  DAPIMatches,
  DAPISteam,
  getAccoladeNameFromId,
  getHeroNameFromId,
} from "../../steam/deadlockApis";
import deadlockJson from "../../../resources/deadlock.json";
import {
  BulkMetadata,
  Player,
  PlayerAccolade,
} from "../../types/steam/Deadlock";
import { MatchSaltsResponse } from "../../../deadlock-ts";
import { AxiosError } from "axios";
import { GenericNumberObject } from "../../types/Generic";
import { isSendableChannel } from "../../util/typeGuards";

export default {
  data: new SlashCommandBuilder()
    .setName("dmatch")
    .setDescription("Get metadata about a given match")
    .addNumberOption((opt) =>
      opt
        .setName("id")
        .setDescription("The match ID to query")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const matchId = interaction.options.getNumber("id") ?? 0;

    // This catch fails to catch the 404 AxiosError!!!
    try {
      // I run this first just to check the salt exists, and it's ready to be fetched
      const saltData: MatchSaltsResponse | null = await DAPIMatches()
        .salts({ matchId })
        .then((a) => (a.status <= 200 ? a.data : null))
        .catch();

      if (!saltData?.metadata_salt) {
        throw new AxiosError();
      }
    } catch {
      await interaction.reply(
        `Could not get metadata salt for match ID ${matchId}!`
      );
      return;
    }

    // For some reason the bulkMetadata signature returns number[]?
    const bulkMetadata: BulkMetadata[] = (await DAPIMatches()
      .bulkMetadata({
        includeInfo: true,
        includeMoreInfo: true,
        includePlayerInfo: true,
        includePlayerFinalStats: true,
        matchIds: [matchId],
      })
      .then((a) => a.data)) as BulkMetadata[];
    const metadata: BulkMetadata = bulkMetadata[0];

    const playersTable: string = await getPlayersTable(metadata.players);
    const message = `
Match ID: ${metadata.match_id}

**Start Time:** ${metadata.start_time}
**Winning Team:** ${metadata.winning_team === "Team0" ? "The Archmother" : "The Hidden King"}
**Duration:** ${sToMS(metadata.duration_s)}
**High Skill Range?:** ${f(metadata.is_high_skill_range_parties)}
**Low Priority Pool?:** ${f(metadata.low_pri_pool)}
**New Player Pool?:** ${f(metadata.new_player_pool)}

\`\`\`
${playersTable}
\`\`\`
`;

    await interaction.reply(message);

    const deadlockLinks: GenericNumberObject = deadlockJson;
    const accountId = deadlockLinks[interaction.user.id];

    if (accountId) {
      const linkedPlayer: Player | undefined = metadata.players.find(
        (p) => p.account_id === accountId
      );

      if (linkedPlayer && isSendableChannel(interaction.channel)) {
        await interaction.channel.send(
          `## Accolades\nAvailable if you have linked your account!\n${getPlayerAccolades(linkedPlayer.accolades)}`
        );
      }
    }
  },
};

function sToMS(s: number): string {
  const minutes: number = Math.round(s / 60);
  const seconds: number = s % 60;
  return `${minutes}:${seconds}`;
}

function f(b: boolean): string {
  return b ? "Yes" : "No";
}

async function getPlayersTable(players: Player[]): Promise<string> {
  const playerNames: Record<number, string> = {};

  await DAPISteam()
    .steam({ accountIds: players.map((p) => p.account_id) })
    .then((a) => a.data)
    .then((d) => d.map((p) => (playerNames[p.account_id] = p.personaname)));

  const playerData = await Promise.all(
    players.map(async (p) => ({
      name: playerNames[p.account_id].slice(0, 24),
      heroName: await getHeroNameFromId(p.hero_id),
      buildId: p.hero_build_id,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      team: p.team,
    }))
  );

  const header = `${"Name".padEnd(24)} ${"Hero".padEnd(12)} Build ID  Kills  Deaths  Assists`;
  const headerBar: string = "-".padEnd(header.length, "-");
  const tableA = `\
${playerData
  .filter((p) => p.team === "Team0")
  .map(
    (p) =>
      `${p.name.padEnd(24).slice(0, 24)} ${p.heroName.padEnd(12)} ${p.buildId
        .toString()
        .padEnd(8)}  ${p.kills.toString().padStart(5)}  ${p.deaths
        .toString()
        .padStart(5)}  ${p.assists.toString().padStart(7)}`
  )
  .join("\n")}  
`;
  const tableB = `\
${playerData
  .filter((p) => p.team === "Team1")
  .map(
    (p) =>
      `${p.name.padEnd(24).slice(0, 24)} ${p.heroName.padEnd(12)} ${p.buildId
        .toString()
        .padEnd(8)}  ${p.kills.toString().padStart(5)}  ${p.deaths
        .toString()
        .padStart(5)}  ${p.assists.toString().padStart(7)}`
  )
  .join("\n")}  `;

  const table = `\
${header}
${headerBar}
${tableA}\
*** The Archmother ***

*** The Hidden King ***
${tableB}`;

  return table;
}

function getPlayerAccolades(accolades: PlayerAccolade[]) {
  const lineBreakers: number[] = [6, 11, 15, 26];
  return `\`\`\`
${accolades
  .sort((a, b) => a.accolade_id - b.accolade_id)
  .map(
    (a) =>
      `${lineBreakers.includes(a.accolade_id) ? "\n" : ""}${getAccoladeNameFromId(
        a.accolade_id
      ).padEnd(24)}: ${a.accolade_stat_value.toString().padStart(6)}`
  )
  .join("\n")}
\`\`\``;
}
