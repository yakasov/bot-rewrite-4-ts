import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Repeats any input given")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("message")
        .setDescription("The input to repeat")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const message: string | null = interaction.options.getString("message");

    if (message) {
      await interaction.reply(message);
    }
  },
};
