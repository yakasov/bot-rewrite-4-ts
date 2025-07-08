import { wrapCodeBlockString } from "../../src/util/commonFunctions";

describe("wrapCodeBlockString", () => {
  it("should wrap a string in a code block with no syntax", () => {
    const input = "Hello, World!";
    const expectedOutput = "```\nHello, World!\n```";
    expect(wrapCodeBlockString(input)).toBe(expectedOutput);
  });

  it("should wrap a string in a code block with specified syntax", () => {
    const input = "console.log('Hello, World!');";
    const expectedOutput = "```js\nconsole.log('Hello, World!');\n```";
    expect(wrapCodeBlockString(input, "js")).toBe(expectedOutput);
  });
});
