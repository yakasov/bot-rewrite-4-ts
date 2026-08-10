import { ActivityType } from "discord.js";
import { BotContext } from "../types/BotContext";
import { PresenceStates } from "../types/RunStateEnums";

function setPresence(context: BotContext, text: string) {
  context.client.user?.setPresence({
    activities: [{ name: text, type: ActivityType.Watching }],
  });
}

export async function rollingPresence(context: BotContext): Promise<void> {
  if (context.runState.presence === PresenceStates.SPLASH) {
    setPresence(context, context.splash);
    context.runState.presence = PresenceStates.WEATHER_A;
  } else if (context.runState.presence === PresenceStates.WEATHER_A) {
    setPresence(
      context,
      `Currently ${context.weather.weather.temp.cur.toFixed(1)}℃, feels like ${context.weather.weather.feelsLike.cur.toFixed(1)}℃`
    );
    context.runState.presence = PresenceStates.WEATHER_B;
  } else if (context.runState.presence === PresenceStates.WEATHER_B) {
    setPresence(
      context,
      `Humidity ${context.weather.weather.humidity}%, ${context.weather.weather.description}`
    );
    context.runState.presence = PresenceStates.SPLASH;
  }
}
