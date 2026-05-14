import { REST, Routes } from "discord.js";
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
import { logger } from "../lib/logger";

const commands = [ban, kick, mute, warn, ticket, invites, userinfo, serverinfo, avatar, purge, set, autorole].map((cmd) => cmd.data.toJSON());

export async function deployCommands() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    logger.error("DISCORD_BOT_TOKEN is not set — cannot deploy commands");
    return;
  }

  const rest = new REST().setToken(token);

  try {
    logger.info(`Deploying ${commands.length} slash command(s)...`);
    const data = await rest.put(Routes.applicationCommands(await getApplicationId(token)), {
      body: commands,
    }) as unknown[];
    logger.info({ count: data.length }, "Slash commands deployed successfully");
  } catch (err) {
    logger.error({ err }, "Failed to deploy slash commands");
  }
}

async function getApplicationId(token: string): Promise<string> {
  const rest = new REST().setToken(token);
  const app = await rest.get(Routes.oauth2CurrentApplication()) as { id: string };
  return app.id;
}
