import { writeFile } from "node:fs/promises";
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import deadlockJson from "../../../resources/deadlock.json";
import { GenericNumberObject } from "../../types/Generic";
import { DAPIPlayers } from "../../steam/deadlockApis";

export default {
  data: new SlashCommandBuilder()
    .setName("drank")
    .setDescription("Get an image of your predicted Deadlock rank"),
  async execute(interaction: ChatInputCommandInteraction) {
    const deadlockLinks: GenericNumberObject = deadlockJson;
    const accountId = deadlockLinks[interaction.user.id];

    if (!accountId) {
      await interaction.reply(
        "You need to link your Steam ID using /dlink first!"
      );
      return;
    }

    const path = `./resources/steam/deadlock/${accountId}.png`;
    const rankImageBinary: number[] = await DAPIPlayers()
      .rankPredictImage(
        { accountId: accountId },
        {
          responseType: "arraybuffer",
        }
      )
      .then((a) => a.data);
    await writeFile(path, Buffer.from(rankImageBinary));

    const attachment: AttachmentBuilder = new AttachmentBuilder(path);
    await interaction.reply({ files: [attachment] });
  },
};
