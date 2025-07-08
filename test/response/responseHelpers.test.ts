import { getNicknameFromMessage } from "../../src/response/responseHelpers";
import { mockMessage } from "../mocks/discord";

describe("responseHelpers", () => {
  it("gets valid displayName from message", () => {
    expect(getNicknameFromMessage(mockMessage())).toBe("Test Member");
  });

  it("uses author displayName if member.displayName is not available", () => {
    const message = mockMessage();
    message.guild.members.cache.clear();
    expect(getNicknameFromMessage(message)).toBe("Test User");
  });
});
