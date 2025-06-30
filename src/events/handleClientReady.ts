import { Client } from "discord.js";
import { BotContext } from "../types/BotContext";

export async function handleClientReady(client: Client, context: BotContext): Promise<void> {
  console.log(
    `Current date and time is ${context.currentDate}, ` +
      `logged in as ${client.user?.tag}\n` +
      "Connected and ready to go!\n"
  );

  checkVoiceChannels(); // stats
  await checkBirthdays(true);
  await checkMinecraftServer();

  context.splash = getNewSplash();

  setInterval(() => {
    context.uptime = context.uptime + 10;
  }, getTime({ seconds: 10 }));
  setInterval(checkBirthdays, getTime({ minutes: 15 }));
  setInterval(checkFortniteShop, getTime({ minutes: 15 }));
  setInterval(checkMinecraftServer, getTime({ seconds: 5 })); 
  setInterval(
    () => {
      context.splash = getNewSplash();
    },
    getTime({ minutes: 30 })
  );
  setInterval(checkVoiceChannels, getTime({ seconds: 15 }));
  // setInterval(saveStats, getTime({ minutes: 3 })); 
  // setInterval(backupStats, getTime({ minutes: 15 })); 
  setInterval(updateScores, getTime({ seconds: 30 }));
}
