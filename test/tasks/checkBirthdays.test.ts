import moment from "moment-timezone";
import { mockBotContext } from "../mocks/context";
import { mockClient } from "../mocks/discord";
import * as TestModule from "../../src/tasks/checkBirthdays";
import birthdays from "../../resources/birthdays.json";
import { BirthdayStates } from "../../src/types/RunState";

describe("checkBirthdays", () => {
  it("should do nothing if today is the same as the context current date", async () => {
    const client = mockClient();
    const context = mockBotContext();
    context.currentDate = moment().tz("Europe/London").toDate();

    await TestModule.checkBirthdays(client, context);
    expect(client.guilds.fetch).not.toHaveBeenCalled();
  });

  it("should error if mainGuild ID is invalid", async () => {
    const client = mockClient();
    const context = mockBotContext();
    context.currentDate = moment("1970-01-31").tz("Europe/London").toDate();
    client.guilds.fetch = jest.fn().mockReturnValue(null);

    await TestModule.checkBirthdays(client, context);
    expect(
      moment().tz("Europe/London").isSame(context.currentDate, "day")
    ).toBe(true);
    expect(context.runState.birthdays).toBe(BirthdayStates.ERROR_STOP);
  });

  it("should error if birthdayChannel ID is invalid", async () => {
    const client = mockClient();
    const context = mockBotContext();
    context.currentDate = moment("1970-01-31").tz("Europe/London").toDate();
    client.guilds.fetch = jest.fn().mockReturnValue({
      channels: {
        fetch: jest.fn().mockResolvedValue(null),
      },
    });

    await TestModule.checkBirthdays(client, context);
    expect(
      moment().tz("Europe/London").isSame(context.currentDate, "day")
    ).toBe(true);
    expect(context.runState.birthdays).toBe(BirthdayStates.ERROR_STOP);
  });

  it("should log IDs that are missing from the guild", async () => {
    const client = mockClient();
    const context = mockBotContext();
    context.currentDate = moment("1970-01-31").tz("Europe/London").toDate();
    context.runState.birthdays = BirthdayStates.FIRST_RUN;
    console.log = jest.fn();

    await TestModule.checkBirthdays(client, context);
    expect(
      moment().tz("Europe/London").isSame(context.currentDate, "day")
    ).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        "The following birthday IDs are not present in guild"
      )
    );
    expect(context.runState.birthdays).toBe(BirthdayStates.NORMAL);
  });

  it("should wish members a happy birthday", async () => {
    const client = mockClient();
    const context = mockBotContext();
    context.currentDate = moment("1970-01-31").tz("Europe/London").toDate();
    context.runState.birthdays = BirthdayStates.NORMAL;
    console.log = jest.fn();

    (birthdays as any)["user-id"] = {
      name: "Test User",
      date: moment().tz("Europe/London").format("DD/MM"),
    };

    await TestModule.checkBirthdays(client, context);
    expect(
      moment().tz("Europe/London").isSame(context.currentDate, "day")
    ).toBe(true);

    const guild: any = await client.guilds.fetch();
    const birthdayChannel = await guild.channels.fetch();
    expect(birthdayChannel.send).toHaveBeenCalledWith(
      `Happy Birthday, Test User! (<@user-id>)`
    );
  });
});
