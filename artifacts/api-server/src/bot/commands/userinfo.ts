import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Get information about a user")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to look up (defaults to you)"),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user") ?? interaction.user;
  const guild = interaction.guild;
  const member = guild?.members.cache.get(target.id);

  const badges: string[] = [];
  const flags = target.flags;
  if (flags?.has("Staff")) badges.push("Discord Staff");
  if (flags?.has("Partner")) badges.push("Partnered Server Owner");
  if (flags?.has("Hypesquad")) badges.push("HypeSquad Events");
  if (flags?.has("BugHunterLevel1")) badges.push("Bug Hunter");
  if (flags?.has("BugHunterLevel2")) badges.push("Bug Hunter Level 2");
  if (flags?.has("PremiumEarlySupporter")) badges.push("Early Supporter");
  if (flags?.has("VerifiedDeveloper")) badges.push("Verified Bot Developer");
  if (flags?.has("ActiveDeveloper")) badges.push("Active Developer");

  const createdAt = Math.floor(target.createdTimestamp / 1000);
  const joinedAt = member?.joinedTimestamp
    ? Math.floor(member.joinedTimestamp / 1000)
    : null;

  const roles = member?.roles.cache
    .filter((r) => r.id !== guild?.roles.everyone.id)
    .sort((a, b) => b.position - a.position)
    .first(10)
    .map((r) => `<@&${r.id}>`)
    .join(", ") || "None";

  const embed = new EmbedBuilder()
    .setColor(member?.displayHexColor ?? 0x5865f2)
    .setTitle(target.tag)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "ID", value: target.id, inline: true },
      { name: "Bot", value: target.bot ? "Yes" : "No", inline: true },
      { name: "Account Created", value: `<t:${createdAt}:F> (<t:${createdAt}:R>)` },
      ...(joinedAt ? [{ name: "Joined Server", value: `<t:${joinedAt}:F> (<t:${joinedAt}:R>)` }] : []),
      ...(member ? [{ name: "Nickname", value: member.nickname ?? "None", inline: true }] : []),
      ...(badges.length ? [{ name: "Badges", value: badges.join(", ") }] : []),
      ...(member ? [{ name: `Roles (${member.roles.cache.size - 1})`, value: roles }] : []),
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
