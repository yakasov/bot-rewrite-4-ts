import { Client, Collection, Command } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";

export async function loadCommands(client: Client) {
  if (!client.commands) client.commands = new Collection<string, Command>();

  const commandFiles: string[] = readdirSync(".", { recursive: true }).filter(
    (file: string | Buffer) => !(file instanceof Buffer)
  ) as string[];

  for (const file of commandFiles) {
    const filePath: string = path.join(__dirname, file);
    const command = (await import(filePath)).default as Command;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
