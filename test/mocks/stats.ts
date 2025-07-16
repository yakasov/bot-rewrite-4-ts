import {
  Stats,
  GuildStats,
  UserStats,
  StatsMessage,
  StatsEvent,
  TableData
} from "../../src/types/Stats";

export const mockUserStats1: UserStats = {
  messages: 10,
  voiceTime: 120,
  joinTime: 1620000000,
  lastGainTime: 1620003600,
  totalXP: 500,
  levelXP: 100,
  level: 5,
  name: "TestUser1",
  previousMessages: 5,
  previousVoiceTime: 60,
  uuid: "user-1-uuid",
};

export const mockUserStats2: UserStats = {
  messages: 1000,
  voiceTime: 10000,
  joinTime: 1620000001,
  lastGainTime: 1620007200,
  totalXP: 1500,
  levelXP: 5,
  level: 10,
  name: "TestUser2",
  previousMessages: 10,
  previousVoiceTime: 120,
  uuid: "user-2-uuid",
};

export const mockGuildStatsNoUsers: GuildStats = {
  guild: {
    allowResponses: true,
    rankUpChannel: "rankup-channel-id-1",
  },
  users: {},
};

export const mockGuildStatsWithUsers: GuildStats = {
  guild: {
    allowResponses: false,
    rankUpChannel: "rankup-channel-id-2",
  },
  users: {
    "user-1": mockUserStats1,
    "user-2": mockUserStats2,
  },
};

export const mockStats: Stats = {
  "guild-1": mockGuildStatsNoUsers,
  "guild-2": mockGuildStatsWithUsers,
};

export const mockStatsMessage: StatsMessage = {
  guildId: "guild-1",
  userId: "member-id",
  subject: "Level Up!",
  accolade: "Test Accolade",
  title: "Test Title",
};

export const mockStatsEvent: StatsEvent = {
  userId: "user-1",
  type: "message",
  guildId: "guild-2",
};

export const mockTableData: TableData[] = [
  {
    "#": 2,
    Name: "user-1",
    Level: "100 (0/1 XP)",
    Msgs: 1000,
    "Voice Time": "30m 01s",
    Title: "Test Title"
  },
  {
    "#": 1,
    Name: "user-2",
    Level: "125 (0/1 XP)",
    Msgs: 0,
    "Voice Time": "30d 23h 59m 59s",
    Title: "Test Title 2"
  },
  {
    "#": 3,
    Name: "user-3",
    Level: "1 (0/1 XP)",
    Msgs: 500,
    "Voice Time": "99h 99m 99s",
    Title: "Test Title 3"
  },
]