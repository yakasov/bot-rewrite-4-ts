import * as TestModule from "../../src/tasks/checkMinecraftServer";
import { MinecraftQueryStates } from "../../src/types/RunState";
import { mockBotContext } from "../mocks/context";
import { mockMinecraftResponse, mockResponse } from "../mocks/responses";

describe("getMCStatus", () => {
  it("should handle any error, first run", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.FIRST_RUN;
    (global as any).fetch = jest.fn().mockResolvedValue(null);
    console.error = jest.fn();
    console.warn = jest.fn();

    await TestModule.getMCStatus(context);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.ERROR_STOP);
    expect(console.warn).toHaveBeenCalledWith(
      "firstRun.minecraft is set to state 2, Minecraft will not be queried again this session"
    );
  });

  it("should handle any error, normal run", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.NORMAL;
    (global as any).fetch = jest.fn().mockResolvedValue(null);
    console.error = jest.fn();

    await TestModule.getMCStatus(context);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.ERROR_RETRY);
  });
});

describe("checkMinecraftServer", () => {
  it("should do nothing if minecraft is in ERROR_STOP state", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.ERROR_STOP;

    await TestModule.checkMinecraftServer(context);
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.ERROR_STOP);
  });

  it("should set minecraft to NORMAL state if ERROR_RETRY", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.ERROR_RETRY;

    await TestModule.checkMinecraftServer(context);
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.NORMAL);
  });

  it("should error if no IP and/or Port for Minecraft server query", async () => {
    const context = mockBotContext();
    context.config.minecraft.serverIp = "";

    await TestModule.checkMinecraftServer(context);
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.ERROR_STOP);
  });

  it("should return null if fetch fails", async () => {
    const context = mockBotContext();
    (global as any).fetch = jest.fn().mockResolvedValue(null);

    await TestModule.checkMinecraftServer(context);
    expect(context.client.user!.setPresence).not.toHaveBeenCalled();
  });

  it("should log if server found on first run", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.FIRST_RUN;
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockMinecraftResponse()));
    console.log = jest.fn();

    await TestModule.checkMinecraftServer(context);
    expect(console.log).toHaveBeenCalledWith(
      `\nFound Minecraft server at mock.minecraft.server:25565!`
    );
    expect(context.runState.minecraft).toBe(MinecraftQueryStates.NORMAL);
  });

  it("should not update presence if presence is already updated", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.NORMAL;

    const mockResponseData = mockMinecraftResponse();
    mockResponseData.players.online = 0;
    const mockResponseWrapped = mockResponse("custom");
    mockResponseWrapped.json = jest
      .fn()
      .mockResolvedValue(JSON.stringify(mockResponseData));
    mockResponseWrapped.text = jest.fn().mockResolvedValue(mockResponseData);
    (global as any).fetch = jest.fn().mockResolvedValue(mockResponseWrapped);

    await TestModule.checkMinecraftServer(context);
    expect(context.client.user!.setPresence).not.toHaveBeenCalled();
  });

  it("should update presence if update is allowed", async () => {
    const context = mockBotContext();
    context.runState.minecraft = MinecraftQueryStates.NORMAL;
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockMinecraftResponse()));

    await TestModule.checkMinecraftServer(context);
    expect(context.client.user!.setPresence).toHaveBeenCalledWith({
      activities: [
        {
          name: "(2) Player1, Player2",
          type: 3,
        },
      ],
    });
  });
});
