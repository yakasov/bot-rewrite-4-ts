import * as DiscordSpeechRecognition from "@midspike/discord-speech-recognition";

export async function handleVoiceRecognitionVoiceMessage(voiceMessage: DiscordSpeechRecognition.VoiceMessage) {
  console.log(voiceMessage);
}