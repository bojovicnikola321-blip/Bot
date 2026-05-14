import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { setGuildConfig, getGuildConfig } from "../store";

export const data = new SlashCommandBuilder()
  .setName("autorole")
  .setDescription("Manage the role automatically given to new members")
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("Set the role new members receive when they join")
      .addRoleOption((opt) =>
        opt
          .setName("role")
          .setDescription("The role to assign automatically")
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("remove")
      .setDescription("Remove the auto-role (new members will no longer get a role)"),
  )
  .addSubcommand((sub) =>
    sub
      .setName("info")
      .setDescription("Check which auto-role is currently set"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === "set") {
    const role = interaction.options.getRole("role", true);

    if (role.id === guild.roles.everyone.id) {
      await interaction.reply({ content: "You cannot set `@everyone` as the auto-role.", ephemeral: true });
      return;
    }

    const botMember = guild.members.me;
    if (botMember && role.position >= botMember.roles.highest.position) {
      await interaction.reply({
        content: `I can't assign **${role.name}** because it's higher than or equal to my highest role. Please move my role above it.`,
        ephemeral: true,
      });
      return;
    }

    setGuildConfig(guild.id, { autoRoleId: role.id });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Auto-Role Set")
      .setDescription(`New members will now automatically receive the <@&${role.id}> role when they join.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (sub === "remove") {
    setGuildConfig(guild.id, { autoRoleId: undefined });

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Auto-Role Removed")
      .setDescription("New members will no longer automatically receive a role on join.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (sub === "info") {
    const config = getGuildConfig(guild.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Auto-Role Info")
      .setDescription(
        config.autoRoleId
          ? `The current auto-role is <@&${config.autoRoleId}>.`
          : "No auto-role is currently set. Use `/autorole set @role` to configure one.",
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
