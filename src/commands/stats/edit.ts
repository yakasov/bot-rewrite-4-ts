import {
  SlashCommandBuilder,
  MessageFlags,
  SlashCommandUserOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  ChatInputCommandInteraction,
} from "discord.js";
import type { BotContext } from "../../types/BotContext.d.ts";
import type { UserStats } from "../../types/Stats.d.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit a user's statistics")
    .addUserOption((opt: SlashCommandUserOption) =>
      opt.setName("user").setDescription("The user to edit").setRequired(true)
    )
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("attribute")
        .setDescription("The attribute to edit")
        .setRequired(true)
    )
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("value")
        .setDescription("The value to set the attribute to")
        .setRequired(true)
    )
    .addBooleanOption((opt: SlashCommandBooleanOption) =>
      opt.setName("add").setDescription("If the value should be set or added")
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    context: BotContext
  ): Promise<void> {
    if (!context.stats || !interaction.guild) return;

    const userId: string = interaction.options.getUser("user")?.id as string;
    const attribute: string = interaction.options.getString("attribute") as string;
    const value: string = interaction.options.getString("value") as string;
    const add: boolean = interaction.options.getBoolean("add") ?? false;
    const userStats: UserStats =
      context.stats[interaction.guild.id].users[userId];

    await interaction.client.application.fetch();
    if (
      interaction.user === interaction.client.application.owner ||
      interaction.user.id === (await interaction.guild.fetchOwner()).user.id
    ) {
      try {
        if (value === null) {
          await interaction.reply({
            content: `No value provided for attribute "${attribute}".`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const newValue = /^-?\d+$/u.test(value) ? parseInt(value, 10) : value;
        if (add) {
          if (
            typeof userStats[attribute] !== "number" ||
            typeof newValue !== "number"
          ) {
            await interaction.reply({
              content: `Cannot add non-numeric values to attribute "${attribute}".`,
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          userStats[attribute] += newValue;
        } else {
          userStats[attribute] = newValue;
        }

        await interaction.reply(
          `Set user ${userId} attribute ${attribute} to value ${userStats[attribute]}`
        );
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
