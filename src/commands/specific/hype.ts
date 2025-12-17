import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { getRandomResponse } from "../../response/messageResponders";

export default {
  data: new SlashCommandBuilder()
    .setName("hype")
    .setDescription("Returns a random bot response")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("filter")
        .setDescription(
          "Filter to match responses to. You can probably just leave this blank"
        )
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;

    const filter: string = interaction.options.getString("filter") ?? "";
    const replyMessage: string = getRandomResponse(filter);

    await interaction.reply(replyMessage);
  },
};
