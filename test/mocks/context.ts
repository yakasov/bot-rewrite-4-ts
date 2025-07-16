import { BotContext } from "../../src/types/BotContext";
import { mockClient } from "./discord";

export function mockBotContext(): BotContext {
  return {
    client: mockClient(),
    config: {
      bot: {
        aiChannels: [],
        allowResponses: true,
        responseChance: 100,
      },
      ids: {
        mainGuild: "guild-id",
        birthdayChannel: "birthday-channel-id",
        birthdayRole: "birthday-role-id",
        fortniteChannel: "fortnite-channel-id",
      },
      minecraft: {
        serverIp: "127.0.0.1",
        serverPort: 25565,
        serverOwnerId: "owner-id",
      },
      stats: {
        messageXPGain: 1,
        messageXPGainCooldown: 0,
        voiceChatXPGain: 1,
        XPPerLevel: 100,
      },
    },
    currentDate: new Date(),
    isStatsEnabled: true,
    runState: { birthdays: 1, minecraft: 1 },
    rollTable: [],
    splash: "Test Splash!",
    stats: {},
    uptime: 0,
  };
}
