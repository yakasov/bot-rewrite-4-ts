import { Client, Collection, Command } from "discord.js";
import { getCommandFiles } from "../util/getCommandFiles";

export async function loadCommands(client: Client): Promise<void> {
  if (!client.commands) client.commands = new Collection<string, Command>();

  const commandsDir: string = __dirname;
  const commandFiles: string[] = getCommandFiles(commandsDir);

  for (const filePath of commandFiles) {
    const command: Command = (await import(filePath)).default as Command;
    if (!command) continue;

    if (command && "data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
