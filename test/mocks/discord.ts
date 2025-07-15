import { Client, Collection, Command } from "discord.js";

export function mockClient() {
  const client = new Client({
    intents: [],
  });
  Client.prototype.login = jest.fn().mockResolvedValue("mocked_token");
  client.guilds = {
    fetch: jest.fn().mockResolvedValue(mockGuild()),
    cache: new Collection([["guild-id", mockGuild()]]),
    create: jest.fn(),
    fetchSoundboardSounds: jest.fn(),
    setIncidentActions: jest.fn(),
    widgetImageURL: jest.fn(),
    resolve: jest.fn(),
    resolveId: jest.fn(),
    valueOf: jest.fn(),
    toJSON: jest.fn(),
    [Symbol.iterator]: jest.fn(),
  } as any;
  client.users = {
    fetch: jest.fn().mockResolvedValue(mockUser()),
    cache: new Collection([["user-id", mockUser()]]),
    createDM: jest.fn(),
    dmChannel: jest.fn(),
    deleteDM: jest.fn(),
    fetchFlags: jest.fn(),
    send: jest.fn(),
    resolve: jest.fn(),
    resolveId: jest.fn(),
    valueOf: jest.fn(),
    toJSON: jest.fn(),
    [Symbol.iterator]: jest.fn(),
  } as any;
  client.user = mockUser();
  return client;
}

export function mockChannel(type: "text" | "dm" | "partialGroupDM" = "text") {
  switch (type) {
    case "text":
      return mockTextChannel();
    case "dm":
      return mockDMChannel();
    case "partialGroupDM":
      return mockPartialGroupDMChannel();
    default:
      throw new Error("Invalid channel type");
  }
}

export function mockTextChannel(): any {
  return {
    id: "channel-id",
    isTextBased: () => true,
    isDMBased: () => false,
    send: jest.fn().mockReturnValue({
      awaitMessageComponent: jest.fn(),
      edit: jest.fn(),
    }),
    messages: {
      fetch: jest.fn().mockResolvedValue(
        new Collection([
          ["message-id-1", mockBaseMessage()],
          ["message-id-2", mockBaseMessage("Another message content")],
        ])
      ),
    },
  } as any;
}

export function mockPartialGroupDMChannel() {
  return {
    id: "partial-group-dm-channel-id",
    isTextBased: () => true,
    isDMBased: () => true,
  } as any;
}

export function mockDMChannel() {
  return {
    isTextBased: () => true,
    isDMBased: () => true,
    send: jest.fn(),
  } as any;
}

export function mockBaseMessage(content: string = "Test message content") {
  return {
    attachments: new Collection(),
    author: mockUser(),
    content,
    delete: jest.fn().mockResolvedValue(undefined),
    react: jest.fn(),
    reply: jest.fn(),
    id: "message-id",
  } as any;
}

export function mockMessage(content: string = "Test message content") {
  return {
    channel: mockTextChannel(),
    guild: mockGuild(),
    ...mockBaseMessage(content),
  } as any;
}

export function mockUser() {
  return {
    id: "user-id",
    username: "testuser",
    displayName: "Test User",
    tag: "testuser#1234",
    presence: {
      activities: [
        {
          name: "Test Splash!",
          type: "PLAYING",
        },
      ],
      status: "online",
    },
    setPresence: jest.fn(),
  } as any;
}

export function mockBotUser() {
  return {
    bot: true,
    ...mockUser(),
  };
}

export function mockInteractionCommand() {
  return {
    isCommand: () => true,
    commandName: "testCommand",
    options: {
      getString: jest.fn().mockReturnValue("testOption"),
      getInteger: jest.fn().mockReturnValue(42),
      getBoolean: jest.fn().mockReturnValue(true),
    },
    user: mockUser(),
  } as any;
}

export function mockGuild() {
  return {
    id: "guild-id",
    name: "Test Guild",
    members: {
      cache: new Collection([["member-id", mockGuildMember()]]),
      get: jest.fn().mockReturnValue(mockGuildMember()),
    },
    channels: {
      fetch: jest.fn().mockResolvedValue(mockTextChannel()),
    },
    stickers: {
      cache: new Collection([
        [
          "1087661495552315462",
          {
            id: "1087661495552315462",
            name: "Test Sticker",
          },
        ],
      ]),
    },
    roles: {
      cache: new Collection([["role-id", mockRole()]]),
      fetch: jest.fn().mockResolvedValue({
        id: "role-id",
      }),
    },
  } as any;
}

export function mockGuildMember() {
  return {
    id: "user-id",
    displayName: "Test Member",
    user: mockUser(),
    roles: {
      cache: new Collection(),
      add: jest.fn(),
      remove: jest.fn(),
    },
  } as any;
}

export function mockRole() {
  return {
    id: "role-id",
    name: "Test Role",
    members: new Collection([["member-id", mockGuildMember()]]),
  } as any;
}
