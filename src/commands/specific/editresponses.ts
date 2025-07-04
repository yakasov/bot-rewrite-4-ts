import fs from "fs";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandStringOption,
  SlashCommandNumberOption,
} from "discord.js";
import { generateRollTable } from "../../util/generateRollTable";
import chanceResponsesJSON from "../../../resources/chanceResponses.json";
import { ChanceResponse } from "../../types/JSON";
import { BotContext } from "../../types/BotContext";

const chanceResponses: { [key: string]: ChanceResponse } =
  chanceResponsesJSON as { [key: string]: ChanceResponse };

export default {
  data: new SlashCommandBuilder()
    .setName("editresponses")
    .setDescription("Edit the chance responses table")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("key")
        .setDescription("The response to edit")
        .setRequired(true)
    )
    .addStringOption((opt: SlashCommandStringOption) =>
      opt.setName("string").setDescription("The string to reply with")
    )
    .addNumberOption((opt: SlashCommandNumberOption) =>
      opt
        .setName("chance")
        .setDescription("The chance to reply to a given message")
    )
    .addStringOption((opt: SlashCommandStringOption) =>
      opt.setName("type").setDescription("Message or react")
    ),
  async execute(interaction: ChatInputCommandInteraction, context: BotContext): Promise<void> {
    const key: string = interaction.options.getString("key")!;
    const string: string | null = interaction.options.getString("string");
    const chance: number | null = interaction.options.getNumber("chance");
    const type: string | null = interaction.options.getString("type");

    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      interaction.user.id === (await interaction.guild?.fetchOwner()!).user.id
    ) {
      try {
        if (!chanceResponses[key] && !(string && chance && type)) {
          interaction.reply({
            content: "Key does not exist and not enough values provided.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (type && !["message", "reaction"].includes(type)) {
          interaction.reply({
            content: 'Type must be either "message" or "reaction"!',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        chanceResponses[key] = {
          chance: chance ?? chanceResponses[key].chance,
          string: string ?? chanceResponses[key].string,
          type: (type ?? chanceResponses[key].type) as "message" | "reaction",
        };

        context.rollTable = generateRollTable(chanceResponses);

        fs.writeFileSync(
          "./resources/chanceResponses.json",
          JSON.stringify(chanceResponses)
        );

        interaction.reply(`Updated ${key}.`);
        return;
      } catch (err: any) {
        interaction.reply(err.message);
        return;
      }
    }

    interaction.reply({
      content: "You are not an admin user!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
