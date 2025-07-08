import { Collection } from "discord.js";
import {
  checkMessageReactions,
  replyWithHypeMessage,
  sendCustomResponse,
} from "../../src/response/messageResponders";
import {
  mockBaseMessage,
  mockDMChannel,
  mockGuildMember,
  mockMessage,
} from "../mocks/discord";
import { mockBotContext } from "../mocks/context";

const messageKeyValues = {
  "good bot": ":)",
  "bad bot": "bad {AUTHOR}",
  thanks: "Thanks, {FOLLOWING}, for your meaningful contribution!",
  beast: "{STICKER:1087661495552315462}",
};

describe("replyWithHypeMessage", () => {
  it("should send a hype message in a sendable channel", async () => {
    const message = mockMessage();
    await replyWithHypeMessage(message);
    expect(message.channel.send).toHaveBeenCalled();
  });

  it("should not send a message in a non-sendable channel", async () => {
    const message = mockMessage();
    message.channel = mockDMChannel();
    await replyWithHypeMessage(message);
    expect(message.channel.send).not.toHaveBeenCalled();
  });
});

describe("sendCustomResponse", () => {
  it("should work with no syntax", async () => {
    const message = mockMessage();
    await sendCustomResponse(message, "good bot", messageKeyValues["good bot"]);
    expect(message.channel.send).toHaveBeenCalledWith(":)");
  });

  it("should work with {AUTHOR} syntax", async () => {
    const message = mockMessage();
    await sendCustomResponse(message, "bad bot", messageKeyValues["bad bot"]);
    expect(message.channel.send).toHaveBeenCalledWith("bad Test Member");
  });

  it("should work with {FOLLOWING} syntax", async () => {
    const message = mockMessage("thanks man");
    await sendCustomResponse(message, "thanks", messageKeyValues["thanks"]);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Thanks, man, for your meaningful contribution!"
    );
  });

  it("should work with {FOLLOWING} syntax for previous message with no guild", async () => {
    // I don't think this can happen but worth testing anyway
    const message = mockMessage("thanks");
    await sendCustomResponse(message, "thanks", messageKeyValues["thanks"]);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Thanks, Test User, for your meaningful contribution!"
    );
  });

  it("should work with {FOLLOWING} syntax for previous message with guild", async () => {
    const message = mockMessage("thanks");
    const messageWithGuildCache = mockBaseMessage("My new message");
    messageWithGuildCache.guild = {
      members: {
        cache: new Collection([["user-id", mockGuildMember()]]),
      },
    };
    message.channel.messages.fetch().then((collection: any) => {
      collection.set("message-id-2", messageWithGuildCache);
    });
    await sendCustomResponse(message, "thanks", messageKeyValues["thanks"]);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Thanks, Test Member, for your meaningful contribution!"
    );
  });

  it("should work with {STICKER} syntax", async () => {
    const message = mockMessage();
    await sendCustomResponse(
      message,
      "beast",
      messageKeyValues["beast"] as string
    );
    expect(message.channel.send).toHaveBeenCalledWith({
      stickers: [
        {
          id: "1087661495552315462",
          name: "Test Sticker",
        },
      ],
    });
  });
});

describe("checkMessageReactions", () => {
  it("return on deleted message", async () => {
    const message = mockMessage();
    const context = mockBotContext();
    await checkMessageReactions(message, context);
    expect(message.reply).not.toHaveBeenCalled();
    expect(message.react).not.toHaveBeenCalled();
  });

  it("should reply with a message response", async () => {
    const message = mockMessage();
    const context = mockBotContext();
    context.rollTable = [
      {
        type: "message",
        string: "This is a test response",
        chance: 101,
      },
    ];
    await checkMessageReactions(message, context);
    expect(message.reply).toHaveBeenCalledWith("This is a test response");
    expect(message.react).not.toHaveBeenCalled();
  });

  it("should reply with a react response", async () => {
    const message = mockMessage();
    const context = mockBotContext();
    context.rollTable = [
      {
        type: "reaction",
        string: "reaction string",
        chance: 101,
      },
    ];
    await checkMessageReactions(message, context);
    expect(message.reply).not.toHaveBeenCalled();
    expect(message.react).toHaveBeenCalledWith("reaction string");
  });
});
