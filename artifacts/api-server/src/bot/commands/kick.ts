import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a member from the server")
  .addUserOption((option) =>
    option.setName("user").setDescription("The user to kick").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Reason for the kick"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const member = guild.members.cache.get(target.id);
  if (!member) {
    await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    return;
  }

  if (!member.kickable) {
    await interaction.reply({ content: "I cannot kick this user. They may have a higher role than me.", ephemeral: true });
    return;
  }

  try {
    await member.kick(reason);
    const embed = new EmbedBuilder()
      .setColor(0xff6600)
      .setTitle("Member Kicked")
      .addFields(
        { name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Failed to kick the user.", ephemeral: true });
  }
}
