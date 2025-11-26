import { ActivityType } from "discord.js";
import type { BotContext } from "../types/BotContext.d.ts";
import { checkBirthdays } from "../tasks/checkBirthdays";
import { checkMinecraftServer } from "../tasks/checkMinecraftServer";
// import { checkFortnite } from "../tasks/checkFortnite";
import { getRandomSplash, getTime } from "../tasks/taskHelpers";
import { checkVoiceChannels } from "../stats/addStatEvent";
import { checkAllUserStats } from "../stats/statsHelpers";
import { saveStatsToDatabase } from "../database/saveToDatabase";
import { backupStatsFromDatabaseToJSON } from "../database/backupDatabaseToJSON";

export async function handleClientReady(
  context: BotContext
): Promise<void> {
  console.log(
    `\nCurrent date and time is ${context.currentDate}, ` +
      `logged in as ${context.client.user?.tag}\n` +
      "Connected and ready to go!\n"
  );

  checkVoiceChannels(context);
  await checkBirthdays(context, true);
  await checkMinecraftServer(context);

  context.splash = getRandomSplash();
  context.client.user?.setPresence({
    activities: [{ name: context.splash , type: ActivityType.Watching }]
  });

  setInterval(() => {
    context.uptime = context.uptime + 10;
  }, getTime({ seconds: 10 }));
  setInterval(() => checkBirthdays(context), getTime({ minutes: 15 }));
  // getFestivalData is consistently returning a 404 so I'll disable this for now
  // setInterval(() => checkFortnite(context), getTime({ minutes: 15 }));
  setInterval(() => checkMinecraftServer(context),
    getTime({ seconds: 5 }));
  setInterval(() => {
    context.splash = getRandomSplash();
    context.client.user?.setPresence({
      activities: [{ name: context.splash , type: ActivityType.Watching }]
    });
  }, getTime({ minutes: 30 }));
  setInterval(() => checkVoiceChannels(context), getTime({ seconds: 15 }));
  setInterval(() => saveStatsToDatabase(context), getTime({ minutes: 3 }));
  setInterval(backupStatsFromDatabaseToJSON, getTime({ minutes: 15 }));
  setInterval(() => checkAllUserStats(context), getTime({ seconds: 30 }));
}
