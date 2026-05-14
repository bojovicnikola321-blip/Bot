import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Timeout (mute) a member")
  .addUserOption((option) =>
    option.setName("user").setDescription("The user to mute").setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("duration")
      .setDescription("Timeout duration in minutes (max 40320 = 28 days)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Reason for the mute"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const durationMinutes = interaction.options.getInteger("duration", true);
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

  if (!member.moderatable) {
    await interaction.reply({ content: "I cannot mute this user. They may have a higher role than me.", ephemeral: true });
    return;
  }

  try {
    const durationMs = durationMinutes * 60 * 1000;
    await member.timeout(durationMs, reason);

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle("Member Muted")
      .addFields(
        { name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Duration", value: `${durationMinutes} minute(s)`, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Failed to mute the user.", ephemeral: true });
  }
}
