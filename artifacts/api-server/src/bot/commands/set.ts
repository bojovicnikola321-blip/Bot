import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { setGuildConfig } from "../store";

export const data = new SlashCommandBuilder()
  .setName("set")
  .setDescription("Configure bot settings for this server")
  .addSubcommandGroup((group) =>
    group
      .setName("channel")
      .setDescription("Set channels for bot features")
      .addSubcommand((sub) =>
        sub
          .setName("welcome")
          .setDescription("Set the channel where welcome messages are sent")
          .addChannelOption((opt) =>
            opt
              .setName("channel")
              .setDescription("The channel to use")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName("goodbye")
          .setDescription("Set the channel where goodbye messages are sent")
          .addChannelOption((opt) =>
            opt
              .setName("channel")
              .setDescription("The channel to use")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName("log")
          .setDescription("Set the channel where moderation logs are sent")
          .addChannelOption((opt) =>
            opt
              .setName("channel")
              .setDescription("The channel to use")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true),
          ),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const group = interaction.options.getSubcommandGroup(true);
  const sub = interaction.options.getSubcommand(true);

  if (group === "channel") {
    const channel = interaction.options.getChannel("channel", true);

    const keyMap: Record<string, "welcomeChannelId" | "goodbyeChannelId" | "logChannelId"> = {
      welcome: "welcomeChannelId",
      goodbye: "goodbyeChannelId",
      log: "logChannelId",
    };

    const labelMap: Record<string, string> = {
      welcome: "Welcome",
      goodbye: "Goodbye",
      log: "Log",
    };

    const key = keyMap[sub];
    if (!key) return;

    setGuildConfig(guild.id, { [key]: channel.id });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Channel Updated")
      .setDescription(`The **${labelMap[sub]}** channel has been set to <#${channel.id}>.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
