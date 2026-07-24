import fs from "node:fs";

const splashes = fs
  .readFileSync("./resources/splashes.txt", "utf-8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * A duration expressed in seconds, minutes, and/or hours.
 */
interface TimeUnits {
  seconds?: number;
  minutes?: number;
  hours?: number;
}

/**
 * Converts a duration into milliseconds.
 *
 * @param units - The duration to convert. Any omitted time units are treated as `0`.
 * @returns The total duration in milliseconds.
 */
export function getTime(units: TimeUnits): number {
  const { seconds = 0, minutes = 0, hours = 0 } = units;
  return 1000 * seconds + 1000 * 60 * minutes + 1000 * 60 * 60 * hours;
}

/**
 * @returns A random Minecraft splash.
 */
export function getRandomSplash(): string {
  return splashes[Math.floor(Math.random() * splashes.length)];
}
