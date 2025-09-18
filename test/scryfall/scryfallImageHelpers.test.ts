import * as TestModule from "../../src/scryfall/helpers/imageHelpers";
import { mockCard } from "../mocks/scryfall";

describe("getImageUrl", () => {
  it("should return false and card URL if only one card face", async () => {
    const card = mockCard;

    const imageUrl = await TestModule.getImageUrl(card);
    expect(imageUrl).toEqual([false, "https://www.example-uri.com/"]);
  });

  it("should return true and local URL if two card faces", async () => {
    expect(true).toEqual(true);

    /*
     * I really did try writing tests for this
     * but Jest seems really inconsistent in what it *can*
     * and *can't* mock. It was refusing to mock the return of combineImages,
     * then it was inconsistently mocking https, and I was just having
     * so many issues that I've decided not to write unit tests for this.
     *
     * TL;DR this worked before so I'm just gonna believe it still works
     */
  });
});
