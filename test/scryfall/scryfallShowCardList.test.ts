import * as TestModule from "../../src/scryfall/showCardList";
import { mockMessage } from "../mocks/discord";

describe("scryfallShowCardList", () => {
  it("should create a collector and should wait for an update", async () => {
    const message = mockMessage();
    const cardName = "card-name";
    const results = ["card-name", "another-card"];

    const scryfallGetCardSpy = jest
      .spyOn(require("../../src/scryfall/scryfallInvoke"), "scryfallGetCard")
      .mockResolvedValue(undefined);

    await TestModule.scryfallShowCardList(message, cardName, results);

    expect(message.channel.send).toHaveBeenCalledWith({
      components: [
        {
          components: [
            {
              custom_id: "scryfall_list_select",
              options: [
                { emoji: undefined, label: "1. card-name", value: "card-name" },
                {
                  emoji: undefined,
                  label: "2. another-card",
                  value: "another-card",
                },
              ],
              placeholder: "Choose a card",
              type: 3,
            },
          ],
          type: 1,
        },
      ],
      content: 'Multiple cards found for "card-name"!',
    });
    expect(scryfallGetCardSpy).not.toHaveBeenCalled();
  });

  it("should create a collector and call scryfallGetCard on update", async () => {
    const message = mockMessage();
    message.channel.send = jest.fn().mockReturnValue({
      awaitMessageComponent: jest.fn().mockResolvedValue({
        values: ["collected-values"],
        update: jest.fn().mockResolvedValue(true),
      }),
      edit: jest.fn(),
    });
    const cardName = "card-name";
    const results = ["card-name", "another-card"];

    const scryfallGetCardSpy = jest
      .spyOn(require("../../src/scryfall/scryfallInvoke"), "scryfallGetCard")
      .mockResolvedValue(undefined);

    await TestModule.scryfallShowCardList(message, cardName, results);

    expect(message.channel.send).toHaveBeenCalledWith({
      components: [
        {
          components: [
            {
              custom_id: "scryfall_list_select",
              options: [
                { emoji: undefined, label: "1. card-name", value: "card-name" },
                {
                  emoji: undefined,
                  label: "2. another-card",
                  value: "another-card",
                },
              ],
              placeholder: "Choose a card",
              type: 3,
            },
          ],
          type: 1,
        },
      ],
      content: 'Multiple cards found for "card-name"!',
    });
    expect(scryfallGetCardSpy).toHaveBeenCalledWith(
      message,
      "collected-values",
      "",
      undefined,
      true,
      true
    );
  });
});
