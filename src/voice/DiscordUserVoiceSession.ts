import { spawn } from "node:child_process";
import prism from "prism-media";
import {
  AudioReceiveStream,
  EndBehaviorType,
  VoiceConnection,
} from "@discordjs/voice";
import ffmpegPath from "ffmpeg-static";
import {
  AzureSpeechRecognizer,
} from "./AzureSpeechRecognizer";

export class DiscordUserVoiceSession {
  private stopped = false;
  private opusStream?: AudioReceiveStream;
  private decoder?: prism.opus.Decoder;
  private resampler?: ReturnType<typeof spawn>;
  private stopPromise?: Promise<void>;

  public constructor(
    private readonly connection: VoiceConnection,
    private readonly userId: string,
    private readonly recognizer: AzureSpeechRecognizer
  ) {}

  public async start(): Promise<void> {
    if (!ffmpegPath) {
      throw new Error("ffmpeg-static did not provide an executable path");
    }

    const opusStream = this.connection.receiver.subscribe(
      this.userId,
      {
        end: {
          behavior: EndBehaviorType.Manual,
        },
      }
    );

    const decoder = new prism.opus.Decoder({
      rate: 48_000,
      channels: 1,
      frameSize: 960,
    });

    const resampler = spawn(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",

        "-f", "s16le",
        "-ar", "48000",
        "-ac", "1",
        "-i", "pipe:0",

        "-f", "s16le",
        "-ar", "16000",
        "-ac", "1",
        "pipe:1",
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    this.opusStream = opusStream;
    this.decoder = decoder;
    this.resampler = resampler;

    try {
      await this.recognizer.start();

      opusStream.pipe(decoder).pipe(resampler.stdin);

      resampler.stdout.on("data", (chunk: Buffer) => {
        if (!this.stopped) {
          this.recognizer.write(chunk);
        }
      });

      resampler.stderr.on("data", (chunk: Buffer) => {
        console.error("FFmpeg:", chunk.toString());
      });

      await new Promise<void>((resolve, reject) => {
        resampler.once("close", () => resolve());
        resampler.once("error", reject);
      });
    } finally {
      await this.cleanup();
    }
  }

  public stop(): void {
    this.stopped = true;
    void this.cleanup();
  }

  private cleanup(): Promise<void> {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    this.stopPromise = (async () => {
      this.opusStream?.destroy();
      this.decoder?.destroy();

      const resampler = this.resampler;
      if (resampler) {
        if (!resampler.stdin?.destroyed) {
          resampler.stdin?.end();
        }

        if (!resampler.killed) {
          resampler.kill();
        }
      }

      await this.recognizer.stop();
    })();

    return this.stopPromise;
  }
}