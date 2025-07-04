import moment from "moment-timezone";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { BotContext } from "../../types/BotContext";
import birthdaysJSON from "../../../resources/birthdays.json";
import { Birthdays } from "../../types/Birthdays";

const birthdays: Birthdays = birthdaysJSON as Birthdays;

export default {
  data: new SlashCommandBuilder()
    .setName("nextbirthdays")
    .setDescription("See when the next five birthdays are."),
  execute(interaction: ChatInputCommandInteraction, context: BotContext): void {
    let output: string = getNextBirthdays(context.currentDate, 5);

    const year: number = context.currentDate.getFullYear();
    if (birthdays[interaction.user.id]) {
      output += `\nYour birthday is set as ${parseBirthday(
        `${birthdays[interaction.user.id].date}/${year}`
      ).format("MMMM Do")}.`;
    } else {
      output += "\nYou do not have a birthday set!";
    }

    interaction.reply(output);
  },
};

function parseBirthday(date: string): moment.Moment {
  return moment(date, "DD/MM/YYYY");
}

function getNextBirthdays(currentDate: Date, count: number = 5): string {
  const year: number = currentDate.getFullYear();

  let orderedBirthdays: string[][] = Object.values(birthdays).map(
    (birthday) => [`${birthday.date}/${year}`, birthday.name]
  );
  orderedBirthdays = orderedBirthdays.concat(
    orderedBirthdays.map(([date, name]) => [
      date.replace(year.toString(), (year + 1).toString()),
      name,
    ])
  );

  orderedBirthdays.sort(
    ([dateA], [dateB]) =>
      parseBirthday(dateA).diff(currentDate, "days") -
      parseBirthday(dateB).diff(currentDate, "days")
  );

  let future: number = 0;
  let output: string = "";
  for (const [date, name] of orderedBirthdays) {
    if (parseBirthday(date).isAfter(currentDate, "day") && future < count) {
      output += `${parseBirthday(date).format("MMMM Do")}: ${name}\n`;
      future++;
    }
    if (future >= count) {
      break;
    }
  }
  return output;
}
