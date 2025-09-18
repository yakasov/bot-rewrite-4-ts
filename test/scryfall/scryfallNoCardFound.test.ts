import * as TestModule from "../../src/scryfall/noCardFound";
import { mockMessage } from "../mocks/discord";

describe("scryfallNoCardFound", () => {
  it("sends an embed", () => {
    const message = mockMessage();
    const cardName = "card-name";

    TestModule.scryfallNoCardFound(message, cardName);
    expect(message.channel.send).toHaveBeenCalledWith({
      embeds: [
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'No card found for "card-name"',
          }),
        }),
      ],
    });
  });
});
