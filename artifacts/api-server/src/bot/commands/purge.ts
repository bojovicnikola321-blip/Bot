import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Delete multiple messages at once")
  .addIntegerOption((opt) =>
    opt
      .setName("amount")
      .setDescription("Number of messages to delete (1–100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100),
  )
  .addUserOption((opt) =>
    opt.setName("user").setDescription("Only delete messages from this user"),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);
  const targetUser = interaction.options.getUser("user");
  const channel = interaction.channel as TextChannel;

  if (!channel || !("bulkDelete" in channel)) {
    await interaction.reply({ content: "This command can only be used in a text channel.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    const toDelete = messages
      .filter((m) => {
        if (m.createdTimestamp < twoWeeksAgo) return false;
        if (targetUser && m.author.id !== targetUser.id) return false;
        return true;
      })
      .first(amount);

    if (toDelete.length === 0) {
      await interaction.editReply("No eligible messages found to delete (messages older than 14 days cannot be bulk deleted).");
      return;
    }

    const deleted = await channel.bulkDelete(toDelete, true);
    await interaction.editReply(
      `Deleted **${deleted.size}** message(s)${targetUser ? ` from ${targetUser.tag}` : ""}.`,
    );
  } catch {
    await interaction.editReply("Failed to delete messages. Make sure I have the **Manage Messages** permission.");
  }
}
