import * as TestModule from "../../src/util/typeGuards";
import { mockChannel } from "../mocks/discord";

describe("isSendableChannel", () => {
  it("returns true for a text channel", () => {
    expect(TestModule.isSendableChannel(mockChannel())).toBe(true);
  });
  it("returns false for a PartialGroupDMChannel", () => {
    expect(TestModule.isSendableChannel(mockChannel("partialGroupDM"))).toBe(
      false
    );
  });
  it("returns false for a DM-based channel", () => {
    expect(TestModule.isSendableChannel(mockChannel("dm"))).toBe(false);
  });
});
