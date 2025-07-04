import {
  Client,
  Collection,
  Guild,
  GuildMember,
  Role,
  TextChannel,
  User,
} from "discord.js";
import birthdaysJSON from "../../resources/birthdays.json";
import configJSON from "../../resources/config.json";
import moment from "moment-timezone";
import { BotContext } from "../types/BotContext";
import { BirthdayStates } from "../types/RunState";
import { Birthdays } from "../types/Birthdays";
import { Config } from "../types/Config";

const birthdays: Birthdays = birthdaysJSON;
const config: Config = configJSON;

export async function checkBirthdays(
  client: Client,
  context: BotContext,
  force: boolean = false
): Promise<void> {
  const today: moment.Moment = moment().tz("Europe/London");

  if (!today.isSame(context.currentDate, "day") || force) {
    context.currentDate = today.toDate();

    const guild: Guild = await client.guilds.fetch(config.ids.mainGuild);
    const birthdayChannel: TextChannel | null = (await guild.channels.fetch(
      config.ids.birthdayChannel
    )) as TextChannel | null;

    const roleMembers: Collection<string, GuildMember> =
      guild.roles.cache.find(
        (role: Role) => role.id === config.ids.birthdayRole
      )?.members ?? new Collection();
    const guildMembers: Collection<string, GuildMember> = guild.members.cache;

    if (context.runState.birthdays === BirthdayStates.FIRST_RUN) {
      const promises: Promise<void | User>[] = [];

      for (const id of Object.keys(birthdays)) {
        if (!guildMembers.some((member: GuildMember) => member.id === id)) {
          promises.push(
            client.users.fetch(id).then((user: User) => {
              console.warn(`${id} (${user?.tag || "unknown user"})`);
            })
          );
        }
      }

      if (promises.length) {
        console.log(
          `The following birthday IDs are not present in guild ${guild.id} (${guild.name}):`
        );
        await Promise.all(promises);
      }

      context.runState.birthdays = BirthdayStates.NORMAL;
    }

    for (const [, member] of roleMembers) {
      if (birthdays[member.id]?.date !== today.format("DD/MM")) {
        member.roles.remove(config.ids.birthdayRole);
      }
    }

    for (const [, member] of guildMembers) {
      if (
        birthdays[member.id]?.date ===
          today.tz("Europe/London").format("DD/MM") &&
        !roleMembers.some(
          (roleMember: GuildMember) => roleMember.user.id === member.id
        )
      ) {
        member.roles.add(config.ids.birthdayRole);
        birthdayChannel?.send(
          `Happy Birthday, ${birthdays[member.id].name}! (<@${member.id}>)`
        );
      }
    }
  }
}
