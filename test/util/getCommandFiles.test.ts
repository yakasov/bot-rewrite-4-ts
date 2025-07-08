import { getCommandFiles } from "../../src/util/getCommandFiles";

describe("getCommandFiles", () => {
  it("should return an array of command file paths", () => {
    const commandFiles = getCommandFiles("src/commands");
    expect(Array.isArray(commandFiles)).toBe(true);
    expect(commandFiles.length).toBeGreaterThan(0);
    expect(commandFiles.every((file) => file.endsWith(".ts"))).toBe(true);
  });
});
