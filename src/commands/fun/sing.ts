import {
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
  AudioPlayer,
  AudioResource,
} from "@discordjs/voice";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  GuildMember,
} from "discord.js";
import ytdl from "ytdl-core";
import Stream from "stream";
import {
  REGEX_YOUTUBE_URL_FULL,
  REGEX_YOUTUBE_URL_SHORT,
  YT_MAX_AUDIO_SIZE,
} from "../../consts/constants";

export default {
  data: new SlashCommandBuilder()
    .setName("sing")
    .setDescription("Streams from a YouTube url")
    .addStringOption((opt: SlashCommandStringOption) =>
      opt
        .setName("url")
        .setDescription("The YouTube URL to stream from")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // TODO: Check this command even works still
    if (!(interaction.member instanceof GuildMember)) return;
    await interaction.deferReply();

    const url: string = interaction.options.getString("url")!;
    if (
      !REGEX_YOUTUBE_URL_FULL.test(url) &&
      !REGEX_YOUTUBE_URL_SHORT.test(url)
    ) {
      interaction.editReply("Please provide a valid YouTube URL.");
      return;
    }

    const voiceChannelId: string | null = interaction.member.voice?.channelId;
    if (!voiceChannelId) {
      interaction.editReply(
        "You must be in a voice channel to use this command!"
      );
      return;
    }

    try {
      const player: AudioPlayer = createAudioPlayer();
      // TODO: Will this work if already in voice channel?
      joinVoiceChannel({
        adapterCreator: interaction.guild?.voiceAdapterCreator!,
        channelId: voiceChannelId,
        guildId: interaction.guild?.id!,
      }).subscribe(player);

      const ytUrl: string = `${url}&bpctr=${Date.now()}&has_verified=1`;
      const stream: Stream.Readable = ytdl(ytUrl, {
        filter: "audioonly",
        highWaterMark: YT_MAX_AUDIO_SIZE,
      });
      const res: AudioResource = createAudioResource(stream);
      player.play(res);

      await interaction.editReply("Now playing!");
    } catch (err: any) {
      await interaction.editReply(`Error: ${err.message}`);
    }
  },
};
