import fs from "fs";
import { IncomingMessage } from "http";
import https from "https";
import joinImages from "join-images";
import { Card } from "yakasov-scryfall-api";
import { Sharp } from "sharp";

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

export async function combineImages(card: Card): Promise<string> {
  const baseFilePath: string = `./resources/scryfall/images/${card.id}`;

  const filePaths: string[] = await Promise.all([
    downloadImage(card, 0, baseFilePath),
    downloadImage(card, 1, baseFilePath),
  ]);
  const image: Sharp | undefined = await joinImages(filePaths, { direction: "horizontal" }).catch((err: any) => undefined);
  if (!image) return "";
  await image.toFile(`${baseFilePath}.jpg`);

  await deleteFiles(filePaths);
  return baseFilePath;
}

export function downloadImage(
  card: Card,
  i: number,
  baseFilePath: string
): Promise<any> {
  if (!card.card_faces?.[i].image_uris?.large) return new Promise(() => {});

  return new Promise((resolve, reject) => {
    const file: fs.WriteStream = fs.createWriteStream(
      `${baseFilePath}-part${i}`
    );
    https
      .get(
        card.card_faces?.[i].image_uris?.large!,
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

export async function deleteFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(
      (filePath: string) =>
        new Promise<void>((resolve, reject) => {
          fs.unlink(filePath, (err: any) => {
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
