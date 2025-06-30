import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Ping!"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(`Pong! ${interaction.client.ws.ping}ms`);
  },
};
