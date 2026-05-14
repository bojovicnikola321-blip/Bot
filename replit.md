# VYX Studio Discord Bot

A Discord bot with moderation commands and a ticket system for buying plugins or requesting custom bots.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server + Discord bot (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DISCORD_BOT_TOKEN` — Discord bot token from the Developer Portal

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Discord: discord.js v14
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/bot/` — Discord bot code
- `artifacts/api-server/src/bot/commands/` — Slash command handlers (ban, kick, mute, warn, ticket)
- `artifacts/api-server/src/index.ts` — Starts both the HTTP server and the bot

## Architecture decisions

- Bot runs inside the same process as the Express server — no separate worker needed.
- Slash commands are deployed globally on every startup (idempotent REST PUT).
- Warnings are stored in-memory per guild+user (not persisted to DB); can be moved to DB later.
- Ticket channels are created with per-user permission overwrites so only the requester and the bot can see them.
- `GuildMembers` privileged intent is NOT used; all moderation commands work via guild cache populated by `Guilds` intent.

## Product

- `/mute @user <minutes> [reason]` — Times out a member (requires Moderate Members permission)
- `/ban @user [reason]` — Bans a member (requires Ban Members permission)
- `/warn @user <reason>` — Warns a member and DMs them; tracks total warning count
- `/kick @user [reason]` — Kicks a member (requires Kick Members permission)
- `/ticket` — Posts a panel with two buttons: "Buy a Plugin" and "Create a Bot"; clicking opens a private ticket channel

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `GuildMembers` is a privileged intent — do NOT add it back without enabling it in the Discord Developer Portal under Privileged Gateway Intents.
- Slash commands are registered globally (available in all servers the bot joins), not per-guild.
- Ticket close button deletes the channel after a 5-second delay.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
