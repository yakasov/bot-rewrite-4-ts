import OpenWeatherAPI from "openweather-api-node";
import { BotContext } from "../types/BotContext";
import { KEYS } from "../keys";

const weather = new OpenWeatherAPI({
  key: KEYS.OPEN_WEATHER_API_KEY,
  units: "metric",
});
weather.setLocationByCoordinates(51.4112, -0.83565);

export async function checkWeather(context: BotContext): Promise<void> {
  const weatherData = await weather.getCurrent();
  context.weather = weatherData;
}
