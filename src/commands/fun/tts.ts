import fs from "fs";
import {
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
  AudioPlayer,
  AudioResource,
} from "@discordjs/voice";
import {
  ChatInputCommandInteraction,
  GuildMember,
  Interaction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { TTSResponse } from "../../types/responses/TTSResponse";
import { URL_TTS_API } from "../../consts/constants";

export default {
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Generate a TTS output from a given input")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("prompt")
        .setDescription("The prompt for TTS to say")
        .setRequired(true)
    ),
  async execute(interaction: Interaction): Promise<void> {
    if (
      !(interaction instanceof ChatInputCommandInteraction) ||
      !(interaction.member instanceof GuildMember)
    )
      return;
    await interaction.deferReply();

    const prompt: string = interaction.options.getString("prompt")!;

    const player: AudioPlayer = createAudioPlayer();
    joinVoiceChannel({
      adapterCreator: interaction.guild?.voiceAdapterCreator!,
      channelId: interaction.member?.voice.channelId!,
      guildId: interaction.guild?.id!,
    }).subscribe(player);

    await fetch(URL_TTS_API, {
      body: JSON.stringify({
        text: prompt,
        voice: "en_us_001",
      }),
      headers: { "Content-Type": "application/json" },
      method: "post",
    })
      .then((response: Response) => response.json())
      .then(async (response: TTSResponse) => {
        if (response.data) {
          fs.writeFileSync("resources/tts.mp3", response.data, {
            encoding: "base64",
          });
          const res: AudioResource = createAudioResource("resources/tts.mp3");
          player.play(res);
        } else {
          await interaction.reply(response.error!);
        }
      });
  },
};
