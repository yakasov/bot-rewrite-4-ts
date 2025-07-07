import { ActivityType, Client } from "discord.js";
import { BotContext } from "../types/BotContext";
import { MinecraftQueryStates } from "../types/RunState";
import {
  MinecraftResponse,
  MinecraftUser,
} from "../types/responses/MinecraftResponse";
import { URL_MINECRAFT_STATUS } from "../consts/constants";

export async function getMCStatus(
  context: BotContext
): Promise<MinecraftResponse | null> {
  return fetch(`${URL_MINECRAFT_STATUS}/${context.config.minecraft.serverIp}`)
    .then((response: Response) => response.json())
    .then((response: MinecraftResponse | null) => response)
    .catch((err) => {
      console.error(`\n${err}`);

      if (context.runState.minecraft === MinecraftQueryStates.FIRST_RUN) {
        context.runState.minecraft = MinecraftQueryStates.ERROR_STOP;
        console.warn(
          `firstRun.minecraft is set to state ${context.runState.minecraft}, Minecraft will not be queried again this session`
        );
      } else {
        context.runState.minecraft = MinecraftQueryStates.ERROR_RETRY;
      }

      return null;
    });
}

export async function checkMinecraftServer(
  client: Client,
  context: BotContext
): Promise<void> {
  if (context.runState.minecraft === MinecraftQueryStates.ERROR_STOP) return;

  if (context.runState.minecraft === MinecraftQueryStates.ERROR_RETRY) {
    context.runState.minecraft = MinecraftQueryStates.NORMAL;
    return;
  }

  if (
    !(context.config.minecraft.serverIp && context.config.minecraft.serverPort)
  ) {
    console.error("\nNo IP and/or Port for Minecraft server query!\n");
    context.runState.minecraft = MinecraftQueryStates.ERROR_STOP;
    return;
  }

  const response: MinecraftResponse | null = await getMCStatus(context);

  if (response === null) return;

  if (context.runState.minecraft === MinecraftQueryStates.FIRST_RUN) {
    console.log(
      `\nFound Minecraft server at ${response.ip_address}:${response.port}!`
    );

    context.runState.minecraft = MinecraftQueryStates.NORMAL;
  }

  let activityString: string = "";
  const { online } = response.players ?? 0;

  if (online) {
    const players: string[] = response.players.list.map(
      (player: MinecraftUser) => player.name_raw
    );
    activityString = `(${players.length}) ${players.join(", ")}`;
  } else {
    if (client.user?.presence.activities[0]?.name === context.splash) {
      return;
    }

    activityString = context.splash;
  }

  client.user?.setPresence({
    activities: [{ name: activityString, type: ActivityType.Watching }],
  });
}
