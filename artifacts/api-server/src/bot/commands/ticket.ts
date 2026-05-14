import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ButtonInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Open a support ticket panel");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Support Tickets")
    .setDescription(
      "Welcome to our support system!\nClick a button below to open a ticket and our team will assist you.",
    )
    .addFields(
      {
        name: "🔌 Buy a Plugin",
        value: "Purchase a custom plugin for your Minecraft server",
        inline: true,
      },
      {
        name: "🤖 Create a Bot",
        value: "Request a custom Discord bot built for you",
        inline: true,
      },
    )
    .setFooter({ text: "A private channel will be created for your request." })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_plugin")
      .setLabel("Buy a Plugin")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔌"),
    new ButtonBuilder()
      .setCustomId("ticket_bot")
      .setLabel("Create a Bot")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🤖"),
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

export async function handleTicketButton(interaction: ButtonInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const isPlugin = interaction.customId === "ticket_plugin";
  const label = isPlugin ? "buy-plugin" : "create-bot";
  const description = isPlugin
    ? "You've opened a ticket to **buy a Minecraft plugin**. Please describe what kind of plugin you need for your Minecraft server and our team will get back to you."
    : "You've opened a ticket to **create a bot**. Please describe what your bot should do and our team will get back to you.";

  const channelName = `ticket-${label}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const existing = guild.channels.cache.find((c) => c.name === channelName);
  if (existing) {
    await interaction.reply({
      content: `You already have an open ticket: <#${existing.id}>`,
      ephemeral: true,
    });
    return;
  }

  try {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: guild.members.me!.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor(isPlugin ? 0x5865f2 : 0x57f287)
      .setTitle(isPlugin ? "🔌 Plugin Purchase Request" : "🤖 Bot Creation Request")
      .setDescription(description)
      .addFields({ name: "Opened by", value: `<@${interaction.user.id}>` })
      .setFooter({ text: "Our team will be with you shortly." })
      .setTimestamp();

    const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒"),
    );

    await (channel as TextChannel).send({
      content: `<@${interaction.user.id}>`,
      embeds: [ticketEmbed],
      components: [closeRow],
    });

    await interaction.reply({
      content: `Your ticket has been created: <#${channel.id}>`,
      ephemeral: true,
    });
  } catch {
    await interaction.reply({
      content: "Failed to create a ticket channel. Please make sure I have the right permissions.",
      ephemeral: true,
    });
  }
}

export async function handleTicketClose(interaction: ButtonInteraction) {
  const channel = interaction.channel as TextChannel;
  if (!channel) return;

  await interaction.reply({ content: "Closing ticket in 5 seconds..." });
  setTimeout(async () => {
    try {
      await channel.delete("Ticket closed");
    } catch {
      // Channel may already be deleted
    }
  }, 5000);
}
