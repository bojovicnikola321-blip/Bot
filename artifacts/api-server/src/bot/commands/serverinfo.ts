import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Get information about this server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const fetchedGuild = await guild.fetch();

  const owner = await guild.fetchOwner().catch(() => null);
  const createdAt = Math.floor(guild.createdTimestamp / 1000);

  const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
  const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;

  const verificationLevels: Record<number, string> = {
    0: "None",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Very High",
  };

  const boostTier: Record<number, string> = {
    0: "No boost",
    1: "Level 1",
    2: "Level 2",
    3: "Level 3",
  };

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
    .addFields(
      { name: "Owner", value: owner ? `${owner.user.tag}` : "Unknown", inline: true },
      { name: "ID", value: guild.id, inline: true },
      { name: "Created", value: `<t:${createdAt}:F>` },
      { name: "Members", value: String(guild.memberCount), inline: true },
      { name: "Roles", value: String(guild.roles.cache.size), inline: true },
      { name: "Emojis", value: String(guild.emojis.cache.size), inline: true },
      { name: "Channels", value: `📝 ${textChannels} text  🔊 ${voiceChannels} voice  📁 ${categories} categories` },
      { name: "Verification Level", value: verificationLevels[fetchedGuild.verificationLevel] ?? "Unknown", inline: true },
      { name: "Boost Status", value: `${boostTier[guild.premiumTier]} (${guild.premiumSubscriptionCount ?? 0} boosts)`, inline: true },
    )
    .setImage(guild.bannerURL({ size: 1024 }) ?? null)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
