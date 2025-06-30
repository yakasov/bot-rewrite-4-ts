import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandUserOption,
  User,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("getpfp")
    .setDescription("Get a user's (or your) profile picture")
    .addUserOption((opt: SlashCommandUserOption) =>
      opt
        .setName("user")
        .setDescription("The user to get the profile picture of")
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // interaction.member is GuildMember | APIInteractionGuildMember
    if (!(interaction.member instanceof GuildMember)) return;

    try {
      const user: User | null = interaction.options.getUser("user");
      const avatar: string = (user || interaction.user).displayAvatarURL({
        forceStatic: false,
        size: 4096,
      });

      const embed: EmbedBuilder = new EmbedBuilder()
        .setImage(avatar)
        .setAuthor({ name: interaction.member?.displayName });
      await interaction.reply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.reply(err.message);
    }
  },
};
