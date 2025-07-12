import * as TestModule from "../../src/scryfall/scryfallHelpers";
import { mockResponse } from "../mocks/responses";
import { mockByNameResponse } from "../mocks/scryfall";

describe("scryfallHelpers", () => {
  it("should handle a bad fetch", async () => {
    const oracleId = "oracle-id";
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ status: 400, data: null });

    const lowestHighestData = await TestModule.getLowestHighestData(oracleId);
    expect(lowestHighestData).toEqual(undefined);
  });

  it("should get highest and lowest data", async () => {
    const oracleId = "oracle-id";
    (global as any).fetch = jest.fn().mockResolvedValue(
      mockResponse({
        status: 200,
        data: [
          mockByNameResponse,
          {
            ...mockByNameResponse,
            prices: {
              eur: "12.50",
              usd: "1.50",
              usd_foil: "1.50",
            },
          },
        ],
      })
    );

    const lowestHighestData = await TestModule.getLowestHighestData(oracleId);
    expect(lowestHighestData).toEqual({
      highestPrice: 2.5,
      highestSet: "SET",
      highestUrl: "https://www.example-uri.com/",
      lowestPrice: 1.5,
      lowestSet: "SET",
      lowestUrl: "https://www.example-uri.com/",
    });
  });
});
