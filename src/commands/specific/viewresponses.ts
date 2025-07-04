import {
  ChatInputCommandInteraction,
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { wrapCodeBlockString } from "../../util/commonFunctions";
import chanceResponsesJSON from "../../../resources/chanceResponses.json";
import { ChanceResponse } from "../../types/JSON";

const chanceResponses: { [key: string]: ChanceResponse } =
  chanceResponsesJSON as { [key: string]: ChanceResponse };

export default {
  data: new SlashCommandBuilder()
    .setName("viewresponses")
    .setDescription("View the current responses roll table.")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("key")
        .setDescription("The response to view. Leave blank to see all keys")
    ),
  async execute(interaction: Interaction): Promise<void> {
    if (!(interaction instanceof ChatInputCommandInteraction)) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const key: string = interaction.options.getString("key") ?? "";

    if (key) {
      if (chanceResponses[key]) {
        interaction.followUp({
          content: wrapCodeBlockString(
            JSON.stringify(chanceResponses[key], null, 4),
            "json"
          ),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      interaction.followUp({
        content: `Key "${key}" not found. Valid keys: ${Object.keys(
          chanceResponses
        ).join(", ")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    interaction.followUp({
      content: `Valid keys:\n\`\`\`\n${Object.keys(chanceResponses).join(
        ", "
      )}\n\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  },
};
