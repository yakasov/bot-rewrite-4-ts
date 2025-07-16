import * as TestModule from "../../src/stats/statsTableGenerator";
import { mockTableData } from "../mocks/stats";

describe("generateTable", () => {
  it("returns if no data found", () => {
    const tableString = TestModule.generateTable([]);

    expect(tableString).toEqual("No data provided.");
  });

  it("should generate a proper table string with valid data", () => {
    const tableString = TestModule.generateTable(mockTableData);
    const tableStringArray = tableString.split("\n");

    expect(tableStringArray[0].replace(/ /gu, "")).toEqual(
      "#NameLevelMsgsVoiceTimeTitle"
    );
    expect(new RegExp(/^[-\-]+$/gu).test(tableStringArray[1])).toEqual(true);
    expect(tableStringArray[2].indexOf("test")).toEqual(
      tableStringArray[3].indexOf("test")
    );
    expect(tableStringArray[2].indexOf("test")).toEqual(
      tableStringArray[4].indexOf("test")
    );
  });
});
