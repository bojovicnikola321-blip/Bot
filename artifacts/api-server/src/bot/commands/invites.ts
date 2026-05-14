import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("invites")
  .setDescription("Check invite information")
  .addSubcommand((sub) =>
    sub
      .setName("list")
      .setDescription("List all active invites for this server"),
  )
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a new invite link")
      .addIntegerOption((opt) =>
        opt
          .setName("expires")
          .setDescription("Expires in hours (0 = never)")
          .addChoices(
            { name: "Never", value: 0 },
            { name: "1 hour", value: 1 },
            { name: "6 hours", value: 6 },
            { name: "12 hours", value: 12 },
            { name: "24 hours", value: 24 },
          ),
      )
      .addIntegerOption((opt) =>
        opt
          .setName("uses")
          .setDescription("Max number of uses (0 = unlimited)")
          .setMinValue(0)
          .setMaxValue(100),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("user")
      .setDescription("See how many people a user has invited")
      .addUserOption((opt) =>
        opt.setName("target").setDescription("The user to check").setRequired(true),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === "list") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "You need the **Manage Server** permission to view invites.", ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const invites = await guild.invites.fetch();

    if (invites.size === 0) {
      await interaction.editReply("There are no active invites for this server.");
      return;
    }

    const lines = invites
      .sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0))
      .first(15)
      .map((inv) => {
        const inviter = inv.inviter ? `${inv.inviter.tag}` : "Unknown";
        const uses = inv.uses ?? 0;
        const max = inv.maxUses ? `/${inv.maxUses}` : "";
        return `\`${inv.code}\` — ${inviter} — **${uses}${max}** uses — <#${inv.channelId}>`;
      });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Active Invites — ${guild.name}`)
      .setDescription(lines.join("\n"))
      .setFooter({ text: `${invites.size} invite(s) total` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } else if (sub === "create") {
    const channel = interaction.channel;
    if (!channel || !("createInvite" in channel)) {
      await interaction.reply({ content: "Cannot create an invite in this channel.", ephemeral: true });
      return;
    }

    const expiresHours = interaction.options.getInteger("expires") ?? 24;
    const maxUses = interaction.options.getInteger("uses") ?? 0;
    const maxAge = expiresHours === 0 ? 0 : expiresHours * 3600;

    const invite = await channel.createInvite({ maxAge, maxUses, reason: `Created by ${interaction.user.tag}` });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Invite Created")
      .addFields(
        { name: "Link", value: invite.url },
        { name: "Expires", value: expiresHours === 0 ? "Never" : `${expiresHours} hour(s)`, inline: true },
        { name: "Max Uses", value: maxUses === 0 ? "Unlimited" : String(maxUses), inline: true },
        { name: "Channel", value: `<#${invite.channelId}>`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (sub === "user") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "You need the **Manage Server** permission to check user invites.", ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const target = interaction.options.getUser("target", true);
    const invites = await guild.invites.fetch();
    const userInvites = invites.filter((inv) => inv.inviter?.id === target.id);
    const totalUses = userInvites.reduce((acc, inv) => acc + (inv.uses ?? 0), 0);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("User Invites")
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: "User", value: `${target.tag}`, inline: true },
        { name: "Active Invites", value: String(userInvites.size), inline: true },
        { name: "Total Joins via Invites", value: String(totalUses), inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
