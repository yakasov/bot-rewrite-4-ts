import {
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection,
} from "@discordjs/voice";
import { Guild } from "discord.js";
import type { VoiceTranscript } from "../types/voice/VoiceRecognition.d.ts";
import { AzureSpeechRecognizer } from "./AzureSpeechRecognizer";
import { DiscordUserVoiceSession } from "./DiscordUserVoiceSession";

export class VoiceRecognitionManager {
  private readonly sessions = new Map<
    string,
    DiscordUserVoiceSession
  >();

  public constructor(
    private readonly targetUserId: string,
    private readonly azureSpeechKey: string,
    private readonly azureSpeechRegion: string,
    private readonly onTranscript: (
      transcript: VoiceTranscript
    ) => Promise<void>
  ) {
    if (!azureSpeechKey) {
      throw new Error("AZURE_SPEECH_KEY is not configured");
    }

    if (!azureSpeechRegion) {
      throw new Error("AZURE_SPEECH_REGION is not configured");
    }
  }

  public start(guild: Guild, channelId: string): void {
    this.stop(guild.id);

    const connection = joinVoiceChannel({
      adapterCreator: guild.voiceAdapterCreator,
      channelId,
      guildId: guild.id,
      selfDeaf: false,
    });

    const recognizer = new AzureSpeechRecognizer(
      this.azureSpeechKey,
      this.azureSpeechRegion,
      {
        onPartial: (text) => {
          console.debug(`Partial transcript from ${this.targetUserId}: ${text}`);
        },
        onFinal: (text) => {
          void this.onTranscript({
            guildId: guild.id,
            userId: this.targetUserId,
            text,
          }).catch((error) => {
            console.error("Failed to handle voice transcript:", error);
          });
        },
        onError: (error) => {
          console.error("Azure Speech recognition failed:", error);
        },
      }
    );

    const session = new DiscordUserVoiceSession(
      connection,
      this.targetUserId,
      recognizer
    );

    this.sessions.set(guild.id, session);

    void session.start().catch((error) => {
      console.error(
        `Voice recognition failed in guild ${guild.id}:`,
        error
      );

      if (this.sessions.get(guild.id) === session) {
        this.sessions.delete(guild.id);
        connection.destroy();
      }
    });
  }

  public stop(guildId: string): void {
    const session = this.sessions.get(guildId);
    if (session) {
      session.stop();
      this.sessions.delete(guildId);
    }

    const connection: VoiceConnection | undefined =
      getVoiceConnection(guildId);
    if (connection) {
      connection.destroy();
    }
  }

  public stopAll(): void {
    for (const guildId of this.sessions.keys()) {
      this.stop(guildId);
    }
  }
}