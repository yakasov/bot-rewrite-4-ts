import { Client } from "discord.js";
import { BotContext } from "../types/BotContext";
import { checkBirthdays } from "../tasks/checkBirthdays";
import { checkMinecraftServer } from "../tasks/checkMinecraftServer";
import { checkFortnite } from "../tasks/checkFortnite";
import { getRandomSplash, getTime } from "../tasks/taskHelpers";
import { checkVoiceChannels } from "../stats/addStatEvent";
import { checkAllUserStats } from "../stats/statsHelpers";

export async function handleClientReady(
  client: Client,
  context: BotContext
): Promise<void> {
  console.log(
    `Current date and time is ${context.currentDate}, ` +
      `logged in as ${client.user?.tag}\n` +
      "Connected and ready to go!\n"
  );

  checkVoiceChannels(context);
  await checkBirthdays(client, context, true);
  await checkMinecraftServer(client, context);

  context.splash = getRandomSplash();

  setInterval(() => {
    context.uptime = context.uptime + 10;
  }, getTime({ seconds: 10 }));
  setInterval(() => checkBirthdays(client, context), getTime({ minutes: 15 }));
  setInterval(() => checkFortnite(client, context)), getTime({ minutes: 15 });
  setInterval(() => checkMinecraftServer(client, context)),
    getTime({ seconds: 5 });
  setInterval(() => {
    context.splash = getRandomSplash();
  }, getTime({ minutes: 30 }));
  setInterval(() => checkVoiceChannels(context), getTime({ seconds: 15 }));
  // setInterval(saveStats, getTime({ minutes: 3 }));
  // setInterval(backupStats, getTime({ minutes: 15 }));
  setInterval(() => checkAllUserStats(context), getTime({ seconds: 30 }));
}
