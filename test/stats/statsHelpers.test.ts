import * as TestModule from "../../src/stats/statsHelpers";
import { mockBotContext } from "../mocks/context";
import { mockGuild, mockInteractionCommand } from "../mocks/discord";
import {
  mockGuildStatsWithUsers,
  mockStats,
  mockStatsEvent,
  mockUserStats1,
  mockUserStats2,
} from "../mocks/stats";

describe("addToStats", () => {
  it("returns if stats are not enabled", () => {
    const event = { ...mockStatsEvent };
    const context = mockBotContext();
    context.isStatsEnabled = false;

    TestModule.addToStats(event, context);
    expect(context.stats).toEqual({});
  });

  it("returns if stats are null", () => {
    const event = { ...mockStatsEvent };
    const context = mockBotContext();
    context.stats = undefined;

    TestModule.addToStats(event, context);
    expect(context.stats).toEqual(undefined);
  });

  it("returns early on guildInit", () => {
    const event = { ...mockStatsEvent };
    event.type = "guildInit";
    const context = mockBotContext();

    TestModule.addToStats(event, context);
    expect(context.stats?.[event.guildId]?.guild.allowResponses).toEqual(true);
    expect(context.stats?.[event.guildId]?.users).toEqual({});
  });

  it("sets up a user if user is undefined", () => {
    const event = { ...mockStatsEvent };
    const context = mockBotContext();

    TestModule.addToStats(event, context);
    expect(context.stats?.[event.guildId]?.guild.allowResponses).toEqual(true);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].joinTime
    ).toEqual(0);
    expect(
      Object.keys(context.stats?.[event.guildId]?.users[event.userId]!).length
    ).toEqual(10);
  });

  it("returns if message cooldown has not expired", () => {
    const event = { ...mockStatsEvent };
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.config.stats.messageXPGainCooldown = Infinity;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].messages
    ).toEqual(10);
  });

  it("updates messages if cooldown has expired", () => {
    const event = { ...mockStatsEvent };
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].lastGainTime = 0;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].lastGainTime
    ).not.toEqual(0);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].messages
    ).toEqual(11);
  });

  it("updates join time on joinedVoiceChannel event", () => {
    const event = { ...mockStatsEvent };
    event.type = "joinedVoiceChannel";
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].joinTime = 0;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].joinTime
    ).not.toEqual(0);
  });

  it("updates join time on inVoiceChannel event if uptime is less than 0", () => {
    const event = { ...mockStatsEvent };
    event.type = "inVoiceChannel";
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].joinTime = 5;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].joinTime
    ).not.toEqual(5);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].voiceTime
    ).toEqual(120);
  });

  it("updates voice time on inVoiceChannel event with uptime greater than 10 and join time as 0", () => {
    const event = { ...mockStatsEvent };
    event.type = "inVoiceChannel";
    const context = mockBotContext();
    context.uptime = 100;
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].joinTime = 0;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].joinTime
    ).not.toEqual(0);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].voiceTime
    ).toEqual(120);
  });

  it("updates voice time on inVoiceChannel event with uptime greater than 10", () => {
    const event = { ...mockStatsEvent };
    event.type = "inVoiceChannel";
    const context = mockBotContext();
    context.uptime = 100;
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].joinTime = 5;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].joinTime
    ).toBeGreaterThan(1752830941);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].voiceTime
    ).not.toEqual(120);
  });

  it("updates voice time on leftVoiceChannel event", () => {
    const event = { ...mockStatsEvent };
    event.type = "leftVoiceChannel";
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats[event.guildId].users[event.userId].joinTime = 0;

    TestModule.addToStats(event, context);
    expect(
      context.stats?.[event.guildId]?.users[event.userId].voiceTime
    ).not.toEqual(120);
  });
});

describe("checkAllUserStats", () => {
  it("returns if stats are null", () => {
    const context = mockBotContext();

    TestModule.checkAllUserStats(context);
    expect(context.stats).toEqual({});
  });

  it("always calls calculateExperience", () => {
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats["guild-2"].users["user-2"].totalXP = 0;

    const calculateExperienceSpy = jest.spyOn(
      require("../../src/stats/experienceHelpers"),
      "calculateExperience"
    );
    const levelUpSpy = jest.spyOn(
      require("../../src/stats/experienceHelpers"),
      "levelUp"
    );

    TestModule.checkAllUserStats(context);
    expect(calculateExperienceSpy).toHaveBeenCalled();
    expect(levelUpSpy).not.toHaveBeenCalled();
  });

  it("conditionally calls levelUp", () => {
    const context = mockBotContext();
    context.stats = { ...mockStats };
    context.stats["guild-2"].users["user-2"].totalXP = 100000;

    const levelUpSpy = jest.spyOn(
      require("../../src/stats/experienceHelpers"),
      "levelUp"
    );

    TestModule.checkAllUserStats(context);
    expect(levelUpSpy).toHaveBeenCalled();
  });
});

describe("orderStatsByRank", () => {
  it("sorts users by totalXP", () => {
    const stats = { ...mockGuildStatsWithUsers };

    const orderedStats = TestModule.orderStatsByRank(stats);
    expect(orderedStats).toEqual([
      ["user-1", mockUserStats1, 0],
      ["user-2", mockUserStats2, 1],
    ]);
  });
});

describe("getDateNowInSeconds", () => {
  it("returns a number", () => {
    const seconds = TestModule.getDateNowInSeconds();
    expect(typeof seconds).toEqual("number");
  });
});

describe("getNicknameFromInteraction", () => {
  it("returns if no member", () => {
    const interaction = mockInteractionCommand();
    const id = "unknown-id";

    const nickname = TestModule.getNicknameFromInteraction(interaction, id);
    expect(nickname).toBe(undefined);
  });

  it("returns an unsanitized display name", () => {
    const interaction = mockInteractionCommand();
    interaction.guild = mockGuild();
    interaction.guild.members.cache.get("member-id").displayName =
      "\x30My \x50Name";

    const nickname = TestModule.getNicknameFromInteraction(interaction);
    expect(nickname).toEqual("\x30My \x50Name");
  });

  it("returns a sanitized display name", () => {
    const interaction = mockInteractionCommand();
    interaction.guild = mockGuild();
    interaction.guild.members.cache.get("member-id").displayName =
      "\x30My \x50Name";
    const id = "";
    const sanitize = true;

    const nickname = TestModule.getNicknameFromInteraction(
      interaction,
      id,
      sanitize
    );
    expect(nickname).toEqual("0My PName");
  });
});

describe("formatTime", () => {
  it("formats seconds into days, hours, minutes, and seconds", () => {
    const formatted = TestModule.formatTime(90061);
    expect(formatted).toMatch(/1d 01h 01m 01s/);
  });

  it("formats zero seconds as 0d 00h 00m 00s", () => {
    const formatted = TestModule.formatTime(0);
    expect(formatted).toBe(" 0d 00h 00m 00s");
  });

  it("pads single-digit days with a space", () => {
    const formatted = TestModule.formatTime(86400); // 1 day
    expect(formatted.startsWith(" 1d")).toBe(true);
  });
});
