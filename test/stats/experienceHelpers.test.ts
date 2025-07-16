import * as TestModule from "../../src/stats/experienceHelpers";
import { mockBotContext } from "../mocks/context";
import { mockStats, mockUserStats1, mockUserStats2 } from "../mocks/stats";
import ranksJSON from "../../resources/ranks.json";

describe("calculateExperience", () => {
  it("should calculate experience correctly if levelXP is enough to level up", () => {
    const context = mockBotContext();
    const stats = mockUserStats1;

    TestModule.calculateExperience(stats, context);

    expect(stats.levelXP).toBe(0);
    expect(stats.totalXP).toBe(500);
  });

  it("should calculate experience correctly if levelXP is not enough to level up", () => {
    const context = mockBotContext();
    const stats = mockUserStats2;

    TestModule.calculateExperience(stats, context);

    expect(stats.levelXP).toBe(6500);
    expect(stats.totalXP).toBe(11000);
  });
});

describe("levelUp", () => {
  it("should return if no user stats are found", () => {
    const context = mockBotContext();

    const updateStatsOnLevelUpSpy = jest.spyOn(
      TestModule,
      "updateStatsOnLevelUp"
    );

    TestModule.levelUp("guild-1", "user-2", context);
    expect(updateStatsOnLevelUpSpy).not.toHaveBeenCalled();
  });

  it("calls updateStatsOnLevelUp but not sendMessage if level is not a multiple of 10", () => {
    const context = mockBotContext();
    context.stats = mockStats;

    const sendMessageSpy = jest.spyOn(
      require("../../src/stats/sendStatsMessage"),
      "sendMessage"
    );

    TestModule.levelUp("guild-2", "user-1", context);

    expect(context.stats["guild-2"].users["user-1"].level).toBe(6);
    expect(sendMessageSpy).not.toHaveBeenCalled();
  });

  it("calls updateStatsOnLevelUp and sendMessage if level is a multiple of 10", () => {
    const context = mockBotContext();
    context.stats = mockStats;
    context.stats["guild-2"].users["user-1"].level = 9;

    const sendMessageSpy = jest.spyOn(
      require("../../src/stats/sendStatsMessage"),
      "sendMessage"
    );

    TestModule.levelUp("guild-2", "user-1", context);

    expect(context.stats["guild-2"].users["user-1"].level).toBe(10);
    expect(sendMessageSpy).toHaveBeenCalled();
  });
});

describe("getLevelName", () => {
  it("should return expected name for given level", () => {
    const ranks = ranksJSON as { [key: string]: string };
    const levelName = TestModule.getLevelName(20);

    expect(levelName).toBe(`${ranks["3"]}\u001b[0m`);
  });

  it("should return highest name if level exceeds highest name level", () => {
    const ranks = ranksJSON as { [key: string]: string };
    const highestRank = Object.keys(ranks).pop() as string;
    const levelName = TestModule.getLevelName(500);

    expect(levelName).toBe(`${ranks[highestRank]}\u001b[0m`);
  });
});

describe("getRequiredExperience", () => {
  it("returns expected calculation", () => {
    const config = mockBotContext().config;
    const XP = TestModule.getRequiredExperience(25, config);

    expect(XP).toBe(2500);
  });
});

describe("getRequiredExperienceCumulative", () => {
  it("returns expected calculation", () => {
    const config = mockBotContext().config;
    const XP = TestModule.getRequiredExperienceCumulative(25, config);

    expect(XP).toBe(32500);
  });
});

describe("updateStatsOnLevelUp", () => {
  it("should update levelXP but level only once", () => {
    const config = mockBotContext().config;
    const stats = mockUserStats1;
    stats.level = 10;

    TestModule.updateStatsOnLevelUp(stats, config);
    expect(stats.level).toBe(11);
  });

  it("should update levelXP and level multiple times", () => {
    const config = mockBotContext().config;
    const stats = mockUserStats2;

    TestModule.updateStatsOnLevelUp(stats, config);
    expect(stats.level).toBe(15);
  });
});
