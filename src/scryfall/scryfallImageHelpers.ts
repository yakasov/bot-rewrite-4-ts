import fs from "fs";
import { IncomingMessage } from "http";
import https from "https";
import joinImages from "join-images";
import { Card } from "yakasov-scryfall-api";
import sharp, { Sharp } from "sharp";
import { SetResponse } from "../types/scryfall/SetResponse";
import { SCRYFALL_SET_IMAGES_PATH } from "../consts/constants";

const setImageCache: string[] = [];

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
  const image: Sharp | undefined = await joinImages(filePaths, {
    direction: "horizontal",
  }).catch(() => undefined);
  if (!image) return "";
  await image.toFile(`${baseFilePath}.jpg`);

  await deleteFiles(filePaths);
  return baseFilePath;
}

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

export async function getSetImage(cardDetails: Card): Promise<boolean> {
  if (setImageCache.length === 0) {
    fs.readdir(
      SCRYFALL_SET_IMAGES_PATH,
      (_: NodeJS.ErrnoException | null, files: string[]) => {
        files.map((file: string) => setImageCache.push(file));
      }
    );
  }

  if (setImageCache.includes(cardDetails.id)) return true;

  const setInfo: SetResponse = await fetch(cardDetails.set_uri).then(
    (response: Response) => response.json()
  );
  const setSvgBuffer: ArrayBuffer = await fetch(setInfo.icon_svg_uri).then(
    (response: Response) => response.arrayBuffer()
  );
  const setIconPng: Sharp = sharp(setSvgBuffer, { density: 300 }).negate({
    alpha: false,
  });
  const hasSaved: boolean = await setIconPng
    .toFile(`${SCRYFALL_SET_IMAGES_PATH}/${cardDetails.id}.png`)
    .then((_: sharp.OutputInfo) => true)
    .catch((_: unknown) => false);

  setImageCache.push(cardDetails.id);

  return hasSaved;
}
