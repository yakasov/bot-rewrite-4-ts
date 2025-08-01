import * as TestModule from "../../src/tasks/checkFortnite";
import { mockBotContext } from "../mocks/context";
import {
  mockFortniteFestivalResponse,
  mockFortniteResponse,
  mockResponse,
} from "../mocks/responses";

describe("getFortniteShop", () => {
  it("should return valid data", async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteResponse()));
    const data = await TestModule.getFortniteShop();
    expect(data).toBeDefined();
  });

  it("should handle no data returned (HTTP error)", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 999,
    });
    console.error = jest.fn();

    const data = await TestModule.getFortniteShop();
    expect(data).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith("HTTP error! status: 999");
  });

  it("should handle no data returned (general error)", async () => {
    (global as any).fetch = jest.fn();
    console.error = jest.fn();

    const data = await TestModule.getFortniteShop();
    expect(data).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching Fortnite shop:",
      expect.any(Error)
    );
  });
});

describe("getFestivalData", () => {
  it("should return valid data", async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteFestivalResponse()));
    const data = await TestModule.getFestivalData();
    expect(data).toBeDefined();
  });

  it("should handle no data returned (HTTP error)", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 999,
    });
    console.error = jest.fn();

    const data = await TestModule.getFestivalData();
    expect(data).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith("HTTP error! status: 999");
  });

  it("should handle no data returned (general error)", async () => {
    (global as any).fetch = jest.fn();
    console.error = jest.fn();

    const data = await TestModule.getFestivalData();
    expect(data).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching Fortnite Festival data:",
      expect.any(Error)
    );
  });
});

describe("sortSongArray", () => {
  it("should sort songs by title and artist", () => {
    const songs = [
      "Song A - Artist A",
      "Song B - Artist B",
      "Song A - Artist B",
      "Song C - Artist A",
    ];
    const sorted = songs.sort(TestModule.sortSongArray);
    expect(sorted).toEqual([
      "Song A - Artist A",
      "Song C - Artist A",
      "Song A - Artist B",
      "Song B - Artist B",
    ]);
  });

  it("should handle empty arrays", () => {
    const songs: string[] = [];
    const sorted = songs.sort(TestModule.sortSongArray);
    expect(sorted).toEqual([]);
  });
});

describe("checkFortnite", () => {
  beforeEach(() => {
    // Reset the array in-place to avoid breaking references
    TestModule.currentSongs.length = 0;
    TestModule.emoteFlags["Bring It Around"] = false;
    TestModule.emoteFlags["Get Griddy"] = false;
  });

  it("should handle mainGuild ID missing", async () => {
    const context = mockBotContext();
    context.client.guilds.fetch = jest.fn().mockResolvedValue(null);
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteResponse()));
    console.error = jest.fn();

    await TestModule.checkFortnite(context);
    expect(console.error).toHaveBeenCalledWith(
      `Guild not found with ID: guild-id`
    );
  });

  it("should handle fortniteChannel ID missing", async () => {
    const context = mockBotContext();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteResponse()));
    console.error = jest.fn();

    const guild: any = await context.client.guilds.fetch();
    guild.channels.fetch = jest.fn().mockResolvedValue(null);

    await TestModule.checkFortnite(context);
    expect(console.error).toHaveBeenCalledWith(
      `Fortnite channel not found or not text-based in guild guild-id (Test Guild)`
    );
  });

  it("should send appropriate emote messages if data is valid", async () => {
    const context = mockBotContext();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteResponse()));
    console.error = jest.fn();

    const guild: any = await context.client.guilds.fetch();
    const fortniteChannel = await guild.channels.fetch();

    await TestModule.checkFortnite(context);
    expect(TestModule.emoteFlags["Get Griddy"]).toBe(true);
    expect(fortniteChannel.send).toHaveBeenCalledWith(
      TestModule.emoteMessages["Get Griddy"]
    );

    expect(TestModule.emoteFlags["Bring It Around"]).toBe(false);
    expect(fortniteChannel.send).not.toHaveBeenCalledWith(
      TestModule.emoteMessages["Bring It Around"]
    );
  });

  it("should not send song info if currentSongs is empty", async () => {
    const context = mockBotContext();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteResponse()));
    console.error = jest.fn();

    const sortSongArraySpy = jest.spyOn(TestModule, "sortSongArray");

    await TestModule.checkFortnite(context);
    expect(sortSongArraySpy).not.toHaveBeenCalled();
  });

  it("should send song info if currentSongs is different to new songs", async () => {
    const context = mockBotContext();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(mockResponse(mockFortniteFestivalResponse()));
    console.error = jest.fn();
    TestModule.currentSongs.push("Song A - Artist A", "Song B - Artist B");

    const guild: any = await context.client.guilds.fetch();
    const fortniteChannel = await guild.channels.fetch();

    await TestModule.checkFortnite(context);
    expect(fortniteChannel.send).toHaveBeenCalledWith(
      "# Removed Fortnite Jam Tracks\nSong A - Artist A\nSong B - Artist B"
    );
    expect(fortniteChannel.send).toHaveBeenCalledWith(
      "# New Fortnite Jam Tracks\nIt Takes Two - Rob Base & DJ EZ Rock"
    );
    expect(fortniteChannel.send).toHaveBeenCalledTimes(2);
  });
});
