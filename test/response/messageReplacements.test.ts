import * as TestModule from "../../src/response/messageReplacements";
import { mockChannel, mockMessage } from "../mocks/discord";

const steamLink =
  "https://steamcommunity.com/sharedfiles/filedetails/?id=885119667";
const validTwitterLink = "LOL https://twitter.com/user/status/1234567890";
const validXLink = "LOL https://x.com/user/status/1234567890";
const userXLink = "Check out https://x.com/myuser";

describe("sendSteamDirectLink", () => {
  it("replaces a link with REGEX_STEAM_LINK", async () => {
    const message = mockMessage(steamLink);
    await TestModule.sendSteamDirectLink(message);
    expect(message.channel.send).toHaveBeenCalledWith(
      `Embedded link: https://yakasov.github.io/pages/miscellaneous/steam_direct.html?page=${encodeURIComponent(
        steamLink
      )}`
    );
  });

  it("does not send a message if channel is not text-based", async () => {
    const message = mockMessage(steamLink);
    message.channel = mockChannel("dm");
    await TestModule.sendSteamDirectLink(message);
    expect(message.channel.send).not.toHaveBeenCalled();
  });
});

describe("swapTwitterLinks", () => {
  it("replaces Twitter links in a message", async () => {
    const message = mockMessage(validXLink);
    await TestModule.swapTwitterLinks(message);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Test Member sent:\nLOL https://fixupx.com/user/status/1234567890"
    );
    expect(message.delete).toHaveBeenCalled();
  });

  it("replaces multiple Twitter links in a message", async () => {
    const message = mockMessage(`${validXLink}, and ${validTwitterLink}`);
    await TestModule.swapTwitterLinks(message);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Test Member sent:\nLOL https://fixupx.com/user/status/1234567890, and LOL https://fxtwitter.com/user/status/1234567890"
    );
    expect(message.delete).toHaveBeenCalled();
  });

  it("does not replace non-status Twitter links", async () => {
    const message = mockMessage(`${validXLink}, and ${userXLink}`);
    await TestModule.swapTwitterLinks(message);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Test Member sent:\nLOL https://fixupx.com/user/status/1234567890, and Check out https://x.com/myuser"
    );
    expect(message.delete).toHaveBeenCalled();
  });

  it("does not send a message if channel is not text-based", async () => {
    const message = mockMessage(validXLink);
    message.channel = mockChannel("dm");
    await TestModule.swapTwitterLinks(message);
    expect(message.channel.send).not.toHaveBeenCalled();
  });

  it("handle deletion errors gracefully", async () => {
    const message = mockMessage(validXLink);
    message.delete = jest.fn().mockRejectedValue(new Error("Delete failed"));
    await TestModule.swapTwitterLinks(message);
    expect(message.channel.send).toHaveBeenCalled();
    expect(message.delete).toHaveBeenCalled();
  });
});
