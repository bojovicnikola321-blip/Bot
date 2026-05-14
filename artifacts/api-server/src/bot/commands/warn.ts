import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

const warnings = new Map<string, { reason: string; moderator: string; timestamp: Date }[]>();

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warn a member")
  .addUserOption((option) =>
    option.setName("user").setDescription("The user to warn").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("reason").setDescription("Reason for the warning").setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const key = `${guild.id}:${target.id}`;
  const existing = warnings.get(key) ?? [];
  existing.push({ reason, moderator: interaction.user.tag, timestamp: new Date() });
  warnings.set(key, existing);

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle("Member Warned")
    .addFields(
      { name: "User", value: `${target.tag} (${target.id})`, inline: true },
      { name: "Moderator", value: interaction.user.tag, inline: true },
      { name: "Total Warnings", value: String(existing.length), inline: true },
      { name: "Reason", value: reason },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  try {
    await target.send(
      `You have been warned in **${guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${existing.length}`,
    );
  } catch {
    // User may have DMs disabled
  }
}
