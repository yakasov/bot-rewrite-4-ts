import { REST, Routes } from "discord.js";
import path from "node:path";
import configJSON from "../resources/config.json";
import { getCommandFiles } from "./util/getCommandFiles";
import { keys } from "./keys";
import { Config } from "./types/Config";

const config: Config = configJSON;

async function deployCommands() {
  const commands: any[] = [];
  const commandsDir: string = path.join(__dirname, "commands");
  const commandFiles: string[] = getCommandFiles(commandsDir);

  for (const filePath of commandFiles) {
    const commandModule: any = await import(filePath);
    const command: any = commandModule.default || commandModule;

    if (command && "data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  const rest: REST = new REST().setToken(keys.DISCORD_TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data: any = await rest.put(
      Routes.applicationGuildCommands(
        keys.DISCORD_CLIENT_ID,
        config.ids.mainGuild
      ),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${
        (data as any[]).length
      } application (/) commands.`
    );
  } catch (err: any) {
    console.error(err);
  }
}

if (require.main === module) {
  deployCommands().catch(console.error);
}
