import {
  Command,
  Interaction,
  InteractionReplyOptions,
  MessageFlags,
} from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";

const reply: InteractionReplyOptions = {
  content: "There was an error while executing this command!",
  flags: MessageFlags.Ephemeral,
};

export async function handleInteractionCreate(
  interaction: Interaction,
  context: BotContext
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command: Command | undefined = context.client.commands.get(
    interaction.commandName
  );

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, context);
  } catch (err: unknown) {
    console.error(err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
