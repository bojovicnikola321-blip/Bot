import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("Show a user's avatar")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user whose avatar to show (defaults to you)"),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user") ?? interaction.user;
  const member = interaction.guild?.members.cache.get(target.id);

  const globalAvatar = target.displayAvatarURL({ size: 1024, extension: "png" });
  const serverAvatar = member?.avatarURL({ size: 1024, extension: "png" });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${target.tag}'s Avatar`)
    .setImage(serverAvatar ?? globalAvatar)
    .setTimestamp();

  if (serverAvatar && serverAvatar !== globalAvatar) {
    embed.addFields({ name: "Global Avatar", value: `[Click here](${globalAvatar})` });
    embed.setFooter({ text: "Showing server avatar. Click the link above for their global avatar." });
  }

  await interaction.reply({ embeds: [embed] });
}
