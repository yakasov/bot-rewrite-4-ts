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
import type { ChanceResponse } from "../../types/JSON.d.ts";
import type { BotContext } from "../../types/BotContext.d.ts";

const chanceResponses: Record<string, ChanceResponse> =
  chanceResponsesJSON as Record<string, ChanceResponse>;

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
      opt.setName("type").setDescription("Message or reaction")
    )
    .addStringOption((opt: SlashCommandStringOption) =>
      opt.setName("target").setDescription("Target user ID")
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!interaction.guild) return;

    const key: string = interaction.options.getString("key") as string;
    const string: string | null = interaction.options.getString("string");
    const chance: number | null = interaction.options.getNumber("chance");
    const type: string | null = interaction.options.getString("type");
    const target: string | null = interaction.options.getString("target");

    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      interaction.user.id === (await interaction.guild.fetchOwner()).user.id
    ) {
      try {
        if (!chanceResponses[key] && !(string && chance && type)) {
          await interaction.reply({
            content: "Key does not exist and not enough values provided.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (type && !["message", "reaction"].includes(type)) {
          await interaction.reply({
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

        if (target) {
          chanceResponses[key].targetUserId = target;
        }

        context.rollTable = generateRollTable(chanceResponses);

        fs.writeFileSync(
          "./resources/chanceResponses.json",
          JSON.stringify(chanceResponses)
        );

        await interaction.reply(`Updated ${key}.`);
        return;
      } catch (err: unknown) {
        console.error(err);
        return;
      }
    }

    await interaction.reply({
      content: "You are not an admin user!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
