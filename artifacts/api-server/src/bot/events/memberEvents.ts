import { Client, GuildMember, EmbedBuilder, TextChannel } from "discord.js";
import { getGuildConfig } from "../store";
import { logger } from "../../lib/logger";

export function registerMemberEvents(client: Client) {
  client.on("guildMemberAdd", async (member: GuildMember) => {
    const config = getGuildConfig(member.guild.id);

    // Auto-role
    if (config.autoRoleId) {
      try {
        const role = member.guild.roles.cache.get(config.autoRoleId);
        if (role) {
          await member.roles.add(role, "Auto-role on join");
        }
      } catch (err) {
        logger.error({ err, guildId: member.guild.id }, "Failed to assign auto-role");
      }
    }

    // Welcome message
    if (config.welcomeChannelId) {
      const channel = member.guild.channels.cache.get(config.welcomeChannelId) as TextChannel | undefined;
      if (channel) {
        try {
          const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`Welcome to ${member.guild.name}! 🎉`)
            .setDescription(
              `Hey <@${member.id}>, welcome to **${member.guild.name}**! We're thrilled to have you here.\n\n` +
              `📋 **Read the rules** — Make sure to check out our rules channel to keep the community a great place for everyone.\n\n` +
              `🔌 **Check out our paid plans** — We offer custom **Minecraft plugins** and **Discord bots** built just for you. Open a ticket with \`/ticket\` to get started!\n\n` +
              `We hope you enjoy your stay! 🚀`,
            )
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields(
              { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
              { name: "Member #", value: String(member.guild.memberCount), inline: true },
            )
            .setFooter({ text: "Glad to have you with us!" })
            .setTimestamp();

          await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
        } catch (err) {
          logger.error({ err }, "Failed to send welcome message");
        }
      }
    }
  });

  client.on("guildMemberRemove", async (member: GuildMember) => {
    const config = getGuildConfig(member.guild.id);
    if (!config.goodbyeChannelId) return;

    const channel = member.guild.channels.cache.get(config.goodbyeChannelId) as TextChannel | undefined;
    if (!channel) return;

    try {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Goodbye! 👋")
        .setDescription(
          `**${member.user.tag}** has left the server.\n\n` +
          `Goodbye, we hope you will come back to us! 💙`,
        )
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: "You are always welcome back." })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error({ err }, "Failed to send goodbye message");
    }
  });
}
