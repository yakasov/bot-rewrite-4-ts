import { THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF } from "../../src/consts/constants";
import * as TestModule from "../../src/response/checkMessageInvoke";
import { mockBotContext } from "../mocks/context";
import { mockMessage } from "../mocks/discord";

describe("checkMessageInvoke", () => {
  it("should not handle reactions if allowResponses is false", async () => {
    const message = mockMessage();
    const context = mockBotContext();
    context.config.bot.allowResponses = false;

    const checkMessageReactionsSpy = jest.spyOn(
      require("../../src/response/messageResponders"),
      "checkMessageReactions"
    );

    await TestModule.checkMessageInvoke(message, context);
    expect(checkMessageReactionsSpy).not.toHaveBeenCalled();
  });

  it("should call sendSteamDirectLink and return if criteria met", async () => {
    const message = mockMessage(
      "Download https://steamcommunity.com/sharedfiles/filedetails/?id=885119667"
    );
    const context = mockBotContext();

    const sendSteamDirectLinkSpy = jest.spyOn(
      require("../../src/response/messageReplacements"),
      "sendSteamDirectLink"
    );

    await TestModule.checkMessageInvoke(message, context);
    expect(sendSteamDirectLinkSpy).toHaveBeenCalled();
  });

  it("should call swapTwitterLinks and return if criteria met", async () => {
    const message = mockMessage(
      "Test Member sent:\nLOL https://x.com/user/status/1234567890"
    );
    const context = mockBotContext();

    const swapTwitterLinksSpy = jest.spyOn(
      require("../../src/response/messageReplacements"),
      "swapTwitterLinks"
    );

    await TestModule.checkMessageInvoke(message, context);
    expect(swapTwitterLinksSpy).toHaveBeenCalled();
  });

  it("should call replyWithHypeMessage and return if criteria met", async () => {
    const message = mockMessage("The time is 12:45 PM");
    message.author.id = THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF;
    const context = mockBotContext();

    const replyWithHypeMessageSpy = jest.spyOn(
      require("../../src/response/messageResponders"),
      "replyWithHypeMessage"
    );

    await TestModule.checkMessageInvoke(message, context);
    expect(replyWithHypeMessageSpy).toHaveBeenCalled();
  });

  it("should call sendCustomResponse and return if criteria met", async () => {
    const message = mockMessage("this guy is a beast at league!");
    message.author.id = THIS_ID_IS_ALWAYS_LATE_TELL_HIM_OFF;
    const context = mockBotContext();

    const sendCustomResponseSpy = jest.spyOn(
      require("../../src/response/messageResponders"),
      "sendCustomResponse"
    );

    await TestModule.checkMessageInvoke(message, context);
    expect(sendCustomResponseSpy).toHaveBeenCalledTimes(1);
  });
});
