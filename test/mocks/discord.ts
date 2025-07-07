import { Client, Collection, Command } from "discord.js";

export function mockClient() {
  const client = new Client({
    intents: [],
  });
  Client.prototype.login = jest.fn().mockResolvedValue("mocked_token");
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
    send: jest.fn(),
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
