import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Ban a member from the server")
  .addUserOption((option) =>
    option.setName("user").setDescription("The user to ban").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Reason for the ban"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const member = guild.members.cache.get(target.id);
  if (member && !member.bannable) {
    await interaction.reply({ content: "I cannot ban this user. They may have a higher role than me.", ephemeral: true });
    return;
  }

  try {
    await guild.members.ban(target, { reason });
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("Member Banned")
      .addFields(
        { name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Failed to ban the user.", ephemeral: true });
  }
}
