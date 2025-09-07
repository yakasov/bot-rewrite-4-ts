import { ActivityType } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import type { MinecraftResponse, User } from "../types/responses/MinecraftResponse.d.ts";
import { URL_MINECRAFT_STATUS } from "../consts/constants";

enum MinecraftQueryStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
  ERROR_RETRY = 3,
}

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

  let activityString = "";
  const { online } = response.players ?? 0;

  if (online) {
    const players: string[] = response.players.list.map(
      (player: User) => player.name_raw
    );
    activityString = `(${players.length}) ${players.join(", ")}`;
  } else {
    if (context.client.user?.presence.activities[0]?.name === context.splash) {
      return;
    }

    activityString = context.splash;
  }

  context.client.user?.setPresence({
    activities: [{ name: activityString, type: ActivityType.Watching }],
  });
}
