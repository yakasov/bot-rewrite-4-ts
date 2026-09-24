import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export interface AzureSpeechEvents {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
}

export class AzureSpeechRecognizer {
  private readonly audioStream: sdk.PushAudioInputStream;
  private readonly recognizer: sdk.SpeechRecognizer;

  public constructor(
    key: string,
    region: string,
    events: AzureSpeechEvents
  ) {
    if (!key) {
      throw new Error("AZURE_SPEECH_KEY is not configured");
    }

    if (!region) {
      throw new Error("AZURE_SPEECH_REGION is not configured");
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = "en-GB";

    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(
      16_000,
      16,
      1
    );

    this.audioStream = sdk.AudioInputStream.createPushStream(audioFormat);

    const audioConfig = sdk.AudioConfig.fromStreamInput(
      this.audioStream
    );

    this.recognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    this.recognizer.recognizing = (_sender, event) => {
      const text = event.result.text.trim();

      if (text) {
        events.onPartial?.(text);
      }
    };

    this.recognizer.recognized = (_sender, event) => {
      if (
        event.result.reason ===
        sdk.ResultReason.RecognizedSpeech
      ) {
        const text = event.result.text.trim();

        if (text) {
          events.onFinal?.(text);
        }
      }
    };

    this.recognizer.canceled = (_sender, event) => {
      const message = event.errorDetails || "Azure recognition was canceled";

      events.onError?.(new Error(message));
    };
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.recognizer.startContinuousRecognitionAsync(
        resolve,
        reject
      );
    });
  }

  public write(pcm: Buffer): void {
    if (pcm.length === 0) {
      return;
    }

    const buffer = new ArrayBuffer(pcm.byteLength);
    new Uint8Array(buffer).set(pcm);
    this.audioStream.write(buffer);
  }

  public stop(): Promise<void> {
    this.audioStream.close();

    return new Promise((resolve, reject) => {
      this.recognizer.stopContinuousRecognitionAsync(() => {
        this.recognizer.close();
        resolve();
      }, reject);
    });
  }
}