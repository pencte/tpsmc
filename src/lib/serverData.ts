// Simulated server store for demo purposes
// In production, replace with actual Minecraft server API / RCON

export interface Player {
  id: string;
  name: string;
  uuid: string;
  online: boolean;
  playtime: number; // minutes
  health: number;
  hunger: number;
  xp: number;
  world: string;
  x: number;
  y: number;
  z: number;
  isOp: boolean;
  joinedAt?: string;
}

export interface ServerStatus {
  online: boolean;
  version: string;
  motd: string;
  playerCount: number;
  maxPlayers: number;
  tps: number;
  uptime: number; // seconds
  ram: number; // MB used
  maxRam: number; // MB max
  cpu: number; // percent
  world: string;
  seed: string;
  difficulty: string;
  gamemode: string;
  whitelist: boolean;
  pvp: boolean;
}

export interface ChatLog {
  id: string;
  player: string;
  message: string;
  timestamp: number;
  type: "chat" | "join" | "leave" | "death" | "achievement" | "command";
}

// Simulated dynamic data using Math.random with seeded variation
const PLAYERS: Player[] = [
  {
    id: "1", name: "Notch", uuid: "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    online: true, playtime: 12400, health: 18, hunger: 17, xp: 847,
    world: "Overworld", x: 134, y: 64, z: -280, isOp: true, joinedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2", name: "Herobrine", uuid: "f84c6a84-7bed-44d7-a13c-d0a83a6de2b3",
    online: true, playtime: 8960, health: 20, hunger: 20, xp: 1230,
    world: "Nether", x: -45, y: 32, z: 901, isOp: false, joinedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3", name: "Steve", uuid: "8667ba71-b85a-4004-af54-457a9734eed7",
    online: true, playtime: 3210, health: 12, hunger: 14, xp: 320,
    world: "Overworld", x: 0, y: 70, z: 0, isOp: false, joinedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "4", name: "Alex", uuid: "ec70bcaf-702f-4bb8-b48d-276fa52a780c",
    online: false, playtime: 5400, health: 20, hunger: 18, xp: 560,
    world: "End", x: 0, y: 64, z: 0, isOp: false,
  },
  {
    id: "5", name: "jeb_", uuid: "45f50155-8ab7-45f5-a4e0-a63abe73e2cc",
    online: false, playtime: 22100, health: 20, hunger: 20, xp: 2100,
    world: "Overworld", x: 500, y: 100, z: -100, isOp: true,
  },
];

const CHAT_LOGS: ChatLog[] = [
  { id: "1", player: "Notch", message: "Halo semua!", timestamp: Date.now() - 120000, type: "chat" },
  { id: "2", player: "Steve", message: "joined the game", timestamp: Date.now() - 90000, type: "join" },
  { id: "3", player: "Herobrine", message: "Ada yang mau trade diamond?", timestamp: Date.now() - 60000, type: "chat" },
  { id: "4", player: "Steve", message: "was slain by Zombie", timestamp: Date.now() - 45000, type: "death" },
  { id: "5", player: "Notch", message: "Steve hati-hati lol", timestamp: Date.now() - 30000, type: "chat" },
  { id: "6", player: "Steve", message: "Damn respawn...", timestamp: Date.now() - 20000, type: "chat" },
  { id: "7", player: "Herobrine", message: "earned [Getting Wood]", timestamp: Date.now() - 10000, type: "achievement" },
];

export function getServerStatus(): ServerStatus {
  const noise = Math.sin(Date.now() / 10000);
  return {
    online: true,
    version: "1.20.4",
    motd: "§aSelamat Datang di Server Kami!",
    playerCount: PLAYERS.filter(p => p.online).length,
    maxPlayers: 20,
    tps: Math.max(16, Math.min(20, 19.2 + noise * 0.8)),
    uptime: Math.floor(Date.now() / 1000) - 1700000000,
    ram: Math.floor(2048 + noise * 200),
    maxRam: 4096,
    cpu: Math.max(5, Math.min(85, 35 + noise * 20)),
    world: "survival_world",
    seed: "-1234567890",
    difficulty: "Normal",
    gamemode: "Survival",
    whitelist: false,
    pvp: true,
  };
}

export function getPlayers(): Player[] {
  return PLAYERS;
}

export function getChatLogs(): ChatLog[] {
  return CHAT_LOGS;
}
