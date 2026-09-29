import fs from "fs";
import { IncomingMessage } from "http";
import https from "https";
import joinImages from "join-images";
import { Card } from "scryfall-api";
import { Sharp } from "sharp";

/**
 * Gets an image URL for a card, building one if a card is double sided and otherwise using the provided one.
 * 
 * @param cardDetails - a Card object
 * @returns an array of [0] whether the URL is local (for attachment use), [1] the image URL
 */
export async function getImageUrl(
  cardDetails: Card
): Promise<[boolean, string]> {
  if (
    cardDetails.card_faces?.length === 2 &&
    cardDetails.card_faces[0].image_uris
  ) {
    return [true, await combineImages(cardDetails)];
  }

  return [false, cardDetails.image_uris?.large ?? ""];
}

/**
 * Combines two images into one, placing them side by side.
 * 
 * @param card - a Card object
 * @returns the URL of the saved, combined images
 */
export async function combineImages(card: Card): Promise<string> {
  const baseFilePath = `./resources/scryfall/images/${card.id}`;

  const filePaths: string[] = await Promise.all([
    downloadImage(card, 0, baseFilePath),
    downloadImage(card, 1, baseFilePath),
  ]);
  const image: Sharp | undefined = await joinImages(filePaths, {
    direction: "horizontal",
  }).catch((error) => {
    console.error("combineImages Error:", error);
    return undefined;
  });
  if (!image) return "";
  await image.toFile(`${baseFilePath}.jpg`);

  await deleteFiles(filePaths);
  return baseFilePath;
}

/**
 * Downloads an image for combining with another, or for caching.
 * 
 * @param card - a Card object
 * @param i - which side of the card to download
 * @param baseFilePath - the directory to save images to
 * @returns the local file paths of the downloaded images
 */
export function downloadImage(
  card: Card,
  i: number,
  baseFilePath: string
): Promise<string> {
  if (!card.card_faces?.[i].image_uris?.large) return new Promise(() => {});

  return new Promise((resolve, reject) => {
    const file: fs.WriteStream = fs.createWriteStream(
      `${baseFilePath}-part${i}`
    );
    https
      .get(
        card.card_faces?.[i].image_uris?.large as string,
        (response: IncomingMessage) => {
          response.pipe(file);

          file.on("finish", () => {
            file.close(() => resolve(`${baseFilePath}-part${i}`));
          });

          file.on("error", (err: Error) => {
            fs.unlink(`${baseFilePath}-part${i}`, () => reject(err));
          });
        }
      )
      .on("error", (err: Error) => {
        reject(err);
      });
  });
}

/**
 * Deletes files for download cleanup.
 * 
 * @param filePaths - an array of file paths
 */
export async function deleteFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(
      (filePath: string) =>
        new Promise<void>((resolve, reject) => {
          fs.unlink(filePath, (err: unknown) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        })
    )
  );
}
