import { Cards } from "scryfall-api";
import * as TestModule from "../../src/scryfall/invoke";
import { mockDMChannel, mockMessage } from "../mocks/discord";

describe("scryfallInvoke", () => {
  it("should return early if message is not in a sendable channel", async () => {
    const message = mockMessage();
    message.channel = mockDMChannel();

    const promiseAllSpy = jest.spyOn(Promise, "all");

    await TestModule.scryfallInvoke(message);
    expect(promiseAllSpy).not.toHaveBeenCalled();
  });

  it("should not create any promises if no matching regex", async () => {
    const message = mockMessage();

    const promiseAllSpy = jest.spyOn(Promise, "all");

    await TestModule.scryfallInvoke(message);
    expect(promiseAllSpy).toHaveBeenCalledWith([]);
  });

  it("should not create any promises if no card name extracted from regex match", async () => {
    const message = mockMessage("[[|set]]");

    const promiseAllSpy = jest.spyOn(Promise, "all");

    await TestModule.scryfallInvoke(message);
    expect(promiseAllSpy).toHaveBeenCalledWith([]);
  });

  it("should create any promises where there are proper matches", async () => {
    const message = mockMessage("[[card name|set]]");

    const promiseAllSpy = jest.spyOn(Promise, "all");

    await TestModule.scryfallInvoke(message);
    expect(promiseAllSpy).toHaveBeenCalledWith([expect.any(Promise)]);
  });
});

describe("scryfallGetCard", () => {
  it("should call scryfallNoCardFound if no results found", async () => {
    const message = mockMessage();
    const cardName = "card-name";

    jest.spyOn(Cards, "autoCompleteName").mockResolvedValue([]);
    const scryfallNoCardFoundSpy = jest
      .spyOn(
        require("../../src/scryfall/scryfallNoCardFound"),
        "scryfallNoCardFound"
      )
      .mockReturnValue(undefined);

    await TestModule.scryfallGetCard(message, cardName);
    expect(scryfallNoCardFoundSpy).toHaveBeenCalled();
  });

  it("should call scryfallCardFound if a result is found", async () => {
    const message = mockMessage();
    const cardName = "card-name";

    jest.spyOn(Cards, "autoCompleteName").mockResolvedValue(["card-name"]);
    const scryfallCardFoundSpy = jest
      .spyOn(
        require("../../src/scryfall/scryfallCardFound"),
        "scryfallCardFound"
      )
      .mockResolvedValue(undefined);

    await TestModule.scryfallGetCard(message, cardName);
    expect(scryfallCardFoundSpy).toHaveBeenCalled();
  });

  it("should call scryfallShowCardList if multiple results found", async () => {
    const message = mockMessage();
    const cardName = "card-name";

    jest
      .spyOn(Cards, "autoCompleteName")
      .mockResolvedValue(["card-name", "another-card"]);
    const scryfallShowCardListSpy = jest
      .spyOn(
        require("../../src/scryfall/scryfallShowCardList"),
        "scryfallShowCardList"
      )
      .mockResolvedValue(undefined);

    await TestModule.scryfallGetCard(message, cardName, undefined, undefined, false);
    expect(scryfallShowCardListSpy).toHaveBeenCalled();
  });
});
