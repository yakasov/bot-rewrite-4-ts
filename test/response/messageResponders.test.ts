import { StickerResolvable } from "discord.js";
import {
  replyWithHypeMessage,
  sendCustomResponse,
} from "../../src/response/messageResponders";
import { mockBaseMessage, mockDMChannel, mockMessage } from "../mocks/discord";

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
    const message = mockMessage();
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
      stickers: ["1087661495552315462"] as StickerResolvable[],
    });
  });
});
