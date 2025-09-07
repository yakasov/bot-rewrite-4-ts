import {
  Collection,
  Guild,
  GuildMember,
  Role,
  TextChannel,
  User,
} from "discord.js";
import birthdaysJSON from "../../resources/birthdays.json";
import moment from "moment-timezone";
import type { BotContext } from "../types/BotContext.d.ts";
import type { Birthdays } from "../types/Birthdays.d.ts";

const birthdays: Birthdays = birthdaysJSON;

enum BirthdayStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
}

export async function checkBirthdays(
  context: BotContext,
  force = false
): Promise<void> {
  const today: moment.Moment = moment().tz("Europe/London");

  if (!today.isSame(context.currentDate, "day") || force) {
    context.currentDate = today.toDate();

    const guild: Guild = await context.client.guilds.fetch(
      context.config.ids.mainGuild
    );

    if (!guild) {
      console.error(`Guild not found with ID: ${context.config.ids.mainGuild}`);
      context.runState.birthdays = BirthdayStates.ERROR_STOP;
      return;
    }

    const birthdayChannel: TextChannel | null = (await guild.channels.fetch(
      context.config.ids.birthdayChannel
    )) as TextChannel | null;

    if (!birthdayChannel || !birthdayChannel.isTextBased()) {
      console.error(
        `Birthday channel not found or not text-based in guild ${guild.id} (${guild.name})`
      );
      context.runState.birthdays = BirthdayStates.ERROR_STOP;
      return;
    }

    const roleMembers: Collection<string, GuildMember> =
      guild.roles.cache.find(
        (role: Role) => role.id === context.config.ids.birthdayRole
      )?.members ?? new Collection();
    const guildMembers: Collection<string, GuildMember> = guild.members.cache;

    if (context.runState.birthdays === BirthdayStates.FIRST_RUN) {
      const promises: Promise<undefined | User>[] = [];

      for (const id of Object.keys(birthdays)) {
        if (!guildMembers.some((member: GuildMember) => member.id === id)) {
          promises.push(
            context.client.users.fetch(id).then((user: User) => {
              console.warn(`${id} (${user?.tag || "unknown user"})`);
              return undefined;
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
        member.roles.remove(context.config.ids.birthdayRole);
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
        member.roles.add(context.config.ids.birthdayRole);
        await birthdayChannel?.send(
          `Happy Birthday, ${birthdays[member.id].name}! (<@${member.id}>)`
        );
      }
    }
  }
}
