import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { wrapCodeBlockString } from "../../util/commonFunctions";
import type { BotContext } from "../../types/BotContext.d.ts";
import { getMCStatus } from "../../tasks/checkMinecraftServer";
import type { MinecraftResponse, NeatResponse } from "../../types/responses/MinecraftResponse.d.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("mcstatus")
    .setDescription("Get information about the current Minecraft server"),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (
      !(
        context.config.minecraft.serverIp && context.config.minecraft.serverPort
      )
    ) {
      await interaction.reply("There is no current Minecraft server set up!");
      return;
    }

    const response: MinecraftResponse | null = await getMCStatus(context);
    if (response === null) return;

    const mappedResponse: NeatResponse = {
      host: response.host,
      ip: response.ip_address,
      port: response.port,
      motd: response.motd.clean,
      players: {
        count: `${response.players.online}/${response.players.max}`,
        online: response.players.list
          .map((player) => player.name_clean)
          .join(", "),
      },
      software: response.software,
      version: response.version.name_clean,
      plugins: response.plugins.length,
      mods: response.mods.length,
    };

    await interaction.reply(
      wrapCodeBlockString(JSON.stringify(mappedResponse, null, 4))
    );
  },
};
