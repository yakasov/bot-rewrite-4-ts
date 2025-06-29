import { Command, Interaction, InteractionReplyOptions, MessageFlags } from "discord.js";

const reply: InteractionReplyOptions = {
  content: "There was an error while executing this command!",
  flags: MessageFlags.Ephemeral
};

export async function handleInteractionCreate(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command: Command | undefined = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}