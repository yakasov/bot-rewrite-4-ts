import * as TestModule from "../../src/stats/sendStatsMessage";
import { mockBotContext } from "../mocks/context";
import { mockGuild } from "../mocks/discord";
import { mockStats, mockStatsMessage } from "../mocks/stats";

describe("sendStatsMessage", () => {
  it("errors on missing guild", async () => {
    const message = { ...mockStatsMessage };
    message.guildId = "invalid-guild-id";
    const context = mockBotContext();
    console.error = jest.fn();

    await TestModule.sendMessage(message, context);
    expect(console.error).toHaveBeenCalledWith(
      "Guild, user, or guild stats not found for guildId: invalid-guild-id, userId: member-id"
    );
  });

  it("errors on missing user", async () => {
    const message = { ...mockStatsMessage };
    message.userId = "invalid-user-id";
    const context = mockBotContext();
    console.error = jest.fn();

    await TestModule.sendMessage(message, context);
    expect(console.error).toHaveBeenCalledWith(
      "Guild, user, or guild stats not found for guildId: guild-1, userId: invalid-user-id"
    );
  });

  it("errors on missing guild stats", async () => {
    const message = { ...mockStatsMessage };
    message.guildId = "guild-3";
    const context = mockBotContext();
    console.error = jest.fn();

    await TestModule.sendMessage(message, context);
    expect(console.error).toHaveBeenCalledWith(
      "Guild, user, or guild stats not found for guildId: guild-3, userId: member-id"
    );
  });

  it("does not send a message if channel not found", async () => {
    const message = { ...mockStatsMessage };
    const context = mockBotContext();

    const isSendableChannelSpy = jest.spyOn(
      require("../../src/util/typeGuards"),
      "isSendableChannel"
    );

    await TestModule.sendMessage(message, context);
    expect(isSendableChannelSpy).not.toHaveBeenCalled();
  });

  it("does send a message if channel found", async () => {
    const message = { ...mockStatsMessage };
    const guild = mockGuild();
    const context = mockBotContext();
    context.stats = mockStats;
    guild.id = "guild-1";
    context.client.guilds.fetch = jest.fn().mockResolvedValue(guild);
    const channel = (await guild.channels.fetch()) as any;

    await TestModule.sendMessage(message, context);
    expect(channel.send).toHaveBeenCalledWith(expect.stringContaining("##"));
  });
});
