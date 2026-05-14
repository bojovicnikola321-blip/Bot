import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
  ButtonInteraction,
} from "discord.js";
import { logger } from "../lib/logger";
import * as ban from "./commands/ban";
import * as kick from "./commands/kick";
import * as mute from "./commands/mute";
import * as warn from "./commands/warn";
import * as ticket from "./commands/ticket";
import * as invites from "./commands/invites";
import * as userinfo from "./commands/userinfo";
import * as serverinfo from "./commands/serverinfo";
import * as avatar from "./commands/avatar";
import * as purge from "./commands/purge";
import * as set from "./commands/set";
import * as autorole from "./commands/autorole";
import { handleTicketButton, handleTicketClose } from "./commands/ticket";
import { registerMemberEvents } from "./events/memberEvents";

type Command = {
  data: { name: string };
  execute: (interaction: never) => Promise<void>;
};

const commands = new Collection<string, Command>();

for (const cmd of [ban, kick, mute, warn, ticket, invites, userinfo, serverinfo, avatar, purge, set, autorole]) {
  commands.set(cmd.data.name, cmd as Command);
}

export function createBot() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    logger.error("DISCORD_BOT_TOKEN is not set — bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    logger.info({ tag: c.user.tag }, "Discord bot is ready");
  });

  registerMemberEvents(client);

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction as never);
      } catch (err) {
        logger.error({ err, command: interaction.commandName }, "Command error");
        const msg = { content: "There was an error executing this command.", ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const btn = interaction as ButtonInteraction;
      try {
        if (btn.customId === "ticket_plugin" || btn.customId === "ticket_bot") {
          await handleTicketButton(btn);
        } else if (btn.customId === "ticket_close") {
          await handleTicketClose(btn);
        }
      } catch (err) {
        logger.error({ err, customId: btn.customId }, "Button handler error");
      }
    }
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });
}
