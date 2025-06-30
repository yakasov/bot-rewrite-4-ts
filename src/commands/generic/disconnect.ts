import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("dc")
    .setDescription("Disconnects the bot from voice chat"),
  execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const conn: VoiceConnection | undefined = getVoiceConnection(
      interaction.guildId
    );
    if (conn) {
      conn.destroy();
    }
  },
};
