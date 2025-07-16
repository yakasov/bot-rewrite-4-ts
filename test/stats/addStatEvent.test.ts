import { Collection } from "discord.js";
import * as TestModule from "../../src/stats/addStatEvent";
import { BotContext } from "../../src/types/BotContext";

describe("checkVoiceChannels", () => {
  it("should add stats for each user in voice channels", () => {
    const context = {
      client: {
        guilds: {
          cache: new Collection([
            [
              "guild1",
              {
                id: "guild1",
                channels: {
                  cache: new Collection([
                    [
                      "voice1",
                      {
                        isVoiceBased: () => true,
                        members: new Collection([
                          ["user1", { user: { id: "user1", bot: false } }],
                          ["user2", { user: { id: "user2", bot: false } }],
                          ["user3", { user: { id: "user3", bot: true } }],
                        ]),
                      },
                    ],
                  ]),
                },
              },
            ],
          ]),
        },
      },
    } as unknown as BotContext;

    const addToStatsSpy = jest.spyOn(
      require("../../src/stats/statsHelpers"),
      "addToStats"
    );

    TestModule.checkVoiceChannels(context);

    expect(addToStatsSpy).toHaveBeenCalledWith(
      { guildId: "guild1", type: "inVoiceChannel", userId: "user1" },
      context
    );
    expect(addToStatsSpy).toHaveBeenCalledWith(
      { guildId: "guild1", type: "inVoiceChannel", userId: "user2" },
      context
    );
  });
});
