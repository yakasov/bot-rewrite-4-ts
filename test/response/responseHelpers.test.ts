import { getNicknameFromMessage } from "../../src/response/responseHelpers";
import { mockMessage } from "../mocks/discord";

describe("responseHelpers", () => {
  it("gets valid displayName from message", () => {
    expect(getNicknameFromMessage(mockMessage())).toBe("Test Member");
  });

  it("has a default value if displayName could not be found", () => {
    const message = mockMessage();
    message.guild.members.cache.clear();
    expect(getNicknameFromMessage(message)).toBe("???");
  });
});
