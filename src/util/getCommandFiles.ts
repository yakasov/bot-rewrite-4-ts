import { readdirSync } from "node:fs";
import path from "node:path";

export function getCommandFiles(baseDir: string): string[] {
  const allFiles: string[] = readdirSync(baseDir, { recursive: true }).filter(
    (file: string | Buffer) => !(file instanceof Buffer)
  ) as string[];
  return (Array.isArray(allFiles) ? allFiles : [])
    .filter((file: string) => file.endsWith(".ts"))
    .map((file: string) => path.join(baseDir, file))
    .map((filePath: string) =>
      process.platform === "win32" ? `file://${filePath}` : filePath
    );
}
