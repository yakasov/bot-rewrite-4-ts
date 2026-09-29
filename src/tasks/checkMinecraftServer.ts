import { ActivityType } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import type { MinecraftResponse, User } from "../types/responses/MinecraftResponse.d.ts";
import { URL_MINECRAFT_STATUS } from "../consts/constants";
import { MinecraftQueryStates } from "../types/RunStateEnums";

/**
 * Calls the MCStatus API to check on the configured server IP.
 * This function will also automatically update the Minecraft Query State
 * to an appropriate value.
 * 
 * @param context 
 * @returns a {@link MinecraftResponse} object (or null if an error occurred)
 */
export async function getMCStatus(
  context: BotContext
): Promise<MinecraftResponse | null> {
  return fetch(`${URL_MINECRAFT_STATUS}/${context.config.minecraft.serverIp}`)
    .then((response: Response) => response.json())
    .then((response: MinecraftResponse | null) => response)
    .catch((error) => {
      console.error("getMCStatus Error:", error);

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

/**
 * Task for checking on a Minecraft server.
 * This will update the bot presence if applicable.
 * 
 * @param context 
 */
export async function checkMinecraftServer(
  context: BotContext
): Promise<void> {
  if (context.runState.minecraft === MinecraftQueryStates.ERROR_STOP) return;

  if (context.runState.minecraft === MinecraftQueryStates.ERROR_RETRY) {
    context.runState.minecraft = MinecraftQueryStates.NORMAL;
    return;
  }

  if (
    !(context.config.minecraft.serverIp)
  ) {
    console.error("\nNo IP provided for Minecraft server query!\n");
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
    activityString = `(${players.length}) ${players.sort().join(", ")}`;
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
