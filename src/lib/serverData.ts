import * as mcsUtil from "minecraft-server-util";
import { Rcon } from "rcon-client";

export interface ServerStatus {
  online: boolean;
  version: string;
  motd: string;
  playerCount: number;
  maxPlayers: number;
  tps: number;
  uptime: number;
  ram: number;
  maxRam: number;
  cpu: number;
  world: string;
  seed: string;
  difficulty: string;
  gamemode: string;
  whitelist: boolean;
  pvp: boolean;
}

const host = process.env.MINECRAFT_SERVER_HOST || "127.0.0.1";
const port = parseInt(process.env.MINECRAFT_SERVER_PORT || "25565");

async function sendRcon(command: string) {
  const rcon = await Rcon.connect({
    host,
    port: parseInt(process.env.RCON_PORT || "25575"),
    password: process.env.RCON_PASSWORD || "",
  });

  const res = await rcon.send(command);
  await rcon.end();
  return res;
}

export async function getServerStatus(): Promise<ServerStatus> {
  try {
    const status = await mcsUtil.status(host, port);

    let tps = 20;

    try {
      const tpsRaw = await sendRcon("tps");
      const match = tpsRaw.match(/([0-9]+\.[0-9]+)/);
      if (match) tps = parseFloat(match[1]);
    } catch {}

    return {
      online: true,
      version: status.version.name,
      motd: status.motd.clean,
      playerCount: status.players.online,
      maxPlayers: status.players.max,
      tps,
      uptime: 0,
      ram: 0,
      maxRam: 0,
      cpu: 0,
      world: "survival",
      seed: "hidden",
      difficulty: "Normal",
      gamemode: "Survival",
      whitelist: false,
      pvp: true,
    };
  } catch {
    return {
      online: false,
      version: "Offline",
      motd: "",
      playerCount: 0,
      maxPlayers: 0,
      tps: 0,
      uptime: 0,
      ram: 0,
      maxRam: 0,
      cpu: 0,
      world: "",
      seed: "",
      difficulty: "",
      gamemode: "",
      whitelist: false,
      pvp: false,
    };
  }
}

export async function getPlayers() {
  try {
    const result = await sendRcon("list");
    return [{ name: result }];
  } catch {
    return [];
  }
}

export function getChatLogs() {
  return [];
}
