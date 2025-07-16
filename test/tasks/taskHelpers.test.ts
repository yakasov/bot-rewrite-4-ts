import * as TestModule from "../../src/tasks/taskHelpers";

describe("getTime", () => {
  it("should return 0 for no input", () => {
    expect(TestModule.getTime({})).toBe(0);
  });

  it("should return correct milliseconds for seconds only", () => {
    expect(TestModule.getTime({ seconds: 5 })).toBe(5000);
  });

  it("should return correct milliseconds for combination of units", () => {
    expect(TestModule.getTime({ seconds: 30, minutes: 1, hours: 2 })).toBe(
      2 * 3600000 + 60 * 1000 + 30 * 1000
    );
  });
});

describe("getRandomSplash", () => {
  it("should return a string", () => {
    const splash = TestModule.getRandomSplash();
    expect(typeof splash).toBe("string");
    expect(splash.length).toBeGreaterThan(0);
  });
});
