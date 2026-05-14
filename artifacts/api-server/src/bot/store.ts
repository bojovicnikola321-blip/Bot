import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const DATA_FILE = join(DATA_DIR, "config.json");

type GuildConfig = {
  welcomeChannelId?: string;
  goodbyeChannelId?: string;
  logChannelId?: string;
  autoRoleId?: string;
};

type Store = Record<string, GuildConfig>;

function load(): Store {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Store;
  } catch {
    return {};
  }
}

function save(data: Store) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getGuildConfig(guildId: string): GuildConfig {
  const store = load();
  return store[guildId] ?? {};
}

export function setGuildConfig(guildId: string, patch: Partial<GuildConfig>) {
  const store = load();
  store[guildId] = { ...(store[guildId] ?? {}), ...patch };
  save(store);
}
