import { Cards } from "scryfall-api";
import * as TestModule from "../../src/scryfall/scryfallCardFound";
import { mockDMChannel, mockMessage } from "../mocks/discord";
import { mockByNameResponse } from "../mocks/scryfall";
import { mockResponse } from "../mocks/responses";

describe("scryfallCardFound", () => {
  it("should return if message is not a sendable channel", async () => {
    const message = mockMessage();
    message.channel = mockDMChannel();
    const cardName = "";
    const set = undefined;

    const cardsByNameSpy = jest.spyOn(
      (await import("scryfall-api")).Cards,
      "byName"
    );

    await TestModule.scryfallCardFound(message, cardName, set);
    expect(cardsByNameSpy).not.toHaveBeenCalled();
  });

  it("should return if message is not a sendable channel", async () => {
    const message = mockMessage();
    const cardName = "card name";
    const set = undefined;

    jest.spyOn(Cards, "byName").mockResolvedValue(undefined);

    await TestModule.scryfallCardFound(message, cardName, set);
    expect(message.channel.send).toHaveBeenCalledWith(
      "Ran into an error fetching card name for set undefined!"
    );
  });

  it("return card with no valid oracle response", async () => {
    const message = mockMessage();
    const cardName = "card name";
    const set = "set name";
    console.error = jest.fn();

    jest.spyOn(Cards, "byName").mockResolvedValue(mockByNameResponse);

    await TestModule.scryfallCardFound(message, cardName, set);
    expect(console.error).toHaveBeenCalledWith(
      "Couldn't find an Oracle ID for card named card-name, ID card-id!"
    );
    expect(message.channel.send).toHaveBeenCalledWith({
      content: "https://www.example-uri.com/",
      embeds: [
        {
          data: {
            footer: {
              icon_url: undefined,
              text: "Legal // $2.50 // Mythic",
            },
            image: {
              url: "https://www.example-uri.com/",
            },
            title: "card-name",
            url: "https://www.example-uri.com/",
          },
        },
      ],
      files: [],
    });
  });

  it("return card with bad oracle response", async () => {
    const message = mockMessage();
    const cardName = "card name";
    const set = "set name";
    console.error = jest.fn();
    console.warn = jest.fn();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ status: 400, data: null });

    jest.spyOn(Cards, "byName").mockResolvedValue({
      ...mockByNameResponse,
      oracle_id: "oracle-id",
    });

    await TestModule.scryfallCardFound(message, cardName, set);
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(message.channel.send).toHaveBeenCalledWith({
      content: "https://www.example-uri.com/",
      embeds: [
        {
          data: {
            footer: {
              icon_url: undefined,
              text: "Legal // $2.50 // Mythic",
            },
            image: {
              url: "https://www.example-uri.com/",
            },
            title: "card-name",
            url: "https://www.example-uri.com/",
          },
        },
      ],
      files: [],
    });
  });

  it("return card with valid oracle response", async () => {
    const message = mockMessage();
    const cardName = "card name";
    const set = "set name";
    console.error = jest.fn();
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue(
        mockResponse({ status: 200, data: [mockByNameResponse] })
      );

    jest.spyOn(Cards, "byName").mockResolvedValue({
      ...mockByNameResponse,
      oracle_id: "oracle-id",
    });

    await TestModule.scryfallCardFound(message, cardName, set);
    expect(console.error).not.toHaveBeenCalled();
    expect(message.channel.send).toHaveBeenCalledWith({
      content: "https://www.example-uri.com/",
      embeds: [
        expect.objectContaining({
          data: expect.objectContaining({
            fields: [
              {
                name: "Prices",
                value: `
Lowest: [SET @$2.5](https://www.example-uri.com/)
Highest: [SET @$2.5](https://www.example-uri.com/)
`,
              },
            ],
            footer: {
              icon_url: undefined,
              text: "Legal // $2.50 // Mythic",
            },
            image: {
              url: "https://www.example-uri.com/",
            },
            title: "card-name",
            url: "https://www.example-uri.com/",
          }),
        }),
      ],
      files: [],
    });
  });
});
