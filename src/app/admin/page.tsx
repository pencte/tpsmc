"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface AdminData {
  timestamp: number;
server: {
  online: boolean;
  version: string;
  playerCount: number;
  maxPlayers: number;
  tps: number;
  uptime: number;
  ram: number;
  maxRam: number;
  cpu: number;
  difficulty: string;
  gamemode: string;
  pvp: boolean;
  whitelist: boolean;
};

  players: {
    id: string;
    uuid: string;
    name: string;
    online: boolean;
    playtime: number;
    health: number;
    hunger: number;
    xp: number;
    world: string;
    x: number;
    y: number;
    z: number;
    isOp: boolean;
    joinedAt?: string;
  }[];
  chat: {
    id: string;
    player: string;
    message: string;
    timestamp: number;
    type: string;
  }[];
  metrics: {
    chunksLoaded: number;
    entitiesLoaded: number;
    dayTime: number;
    weather: string;
  };
}

const ADMIN_TOKEN = "admin123";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-[#1A1A1A]">
      <div
        className="h-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
      />
    </div>
  );
}

function HeartIcons({ health }: { health: number }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = health / 2 > i;
        return (
          <span key={i} className="text-[8px]" style={{ color: filled ? "#F44336" : "#2A2A2A" }}>
            ♥
          </span>
        );
      })}
    </div>
  );
}

function ChatLine({ entry }: { entry: AdminData["chat"][0] }) {
  const colors: Record<string, string> = {
    chat: "#E8E8E8",
    join: "#4CAF50",
    leave: "#F44336",
    death: "#FF9800",
    achievement: "#FFD700",
    command: "#5EDFFF",
  };
  const prefixes: Record<string, string> = {
    join: "→",
    leave: "←",
    death: "✝",
    achievement: "★",
    command: "$",
    chat: ">",
  };
  const isJoinLeave = entry.type === "join" || entry.type === "leave";
  const time = new Date(entry.timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex gap-2 text-[10px] font-mono py-0.5 hover:bg-[#111] px-2 transition-colors">
      <span className="text-[#333] shrink-0">{time}</span>
      <span style={{ color: colors[entry.type] ?? "#E8E8E8" }} className="shrink-0">
        {prefixes[entry.type] ?? ">"}
      </span>
      {!isJoinLeave && (
        <span className="text-[#5EDFFF] shrink-0">{entry.player}:</span>
      )}
      <span style={{ color: colors[entry.type] ?? "#E8E8E8" }}>
        {isJoinLeave ? `${entry.player} ${entry.message}` : entry.message}
      </span>
    </div>
  );
}

function MetricChart({ data, label, color, min, max }: {
  data: number[];
  label: string;
  color: string;
  min: number;
  max: number;
}) {
  const w = 200;
  const h = 40;
  if (data.length < 2) return null;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  });

  return (
    <div className="pixel-border p-2" style={{ background: "#0D0D0D" }}>
      <div className="text-[9px] text-[#444] font-mono mb-1">{label}</div>
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polyline
          points={`0,${h} ${points.join(" ")} ${w},${h}`}
          fill={color}
          fillOpacity="0.05"
          stroke="none"
        />
      </svg>
      <div className="text-[9px] font-mono mt-0.5" style={{ color }}>
        {data[data.length - 1]?.toFixed(1)}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "players" | "chat" | "console">("overview");
  const [consoleCmd, setConsoleCmd] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[Server] Starting Minecraft server...",
    "[Server] Done! For help, type \"help\"",
    "[Server] Server is running.",
  ]);

  const esRef = useRef<EventSource | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const tpsHistory = useRef<number[]>([]);
  const cpuHistory = useRef<number[]>([]);
  const ramHistory = useRef<number[]>([]);
  const [histTick, setHistTick] = useState(0);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_TOKEN) {
      setAuthed(true);
      setError("");
    } else {
      setError("Password salah!");
    }
  }

  useEffect(() => {
    if (!authed) return;

    function connect() {
      const es = new EventSource("/api/admin", {});
      // SSE with token via URL (workaround for EventSource headers limitation)
      // In production use a session cookie or URL token
      esRef.current = es;

      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        const d: AdminData = JSON.parse(e.data);
        setData(d);

        tpsHistory.current.push(d.server.tps);
        cpuHistory.current.push(d.server.cpu);
        ramHistory.current.push(d.server.ram);
        if (tpsHistory.current.length > 30) tpsHistory.current.shift();
        if (cpuHistory.current.length > 30) cpuHistory.current.shift();
        if (ramHistory.current.length > 30) ramHistory.current.shift();
        setHistTick((t) => t + 1);
      };
      es.onerror = () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 3000);
      };
    }

    // Patch: use URL token since EventSource can't set headers
    const _origFetch = window.fetch;
    connect();
    return () => esRef.current?.close();
  }, [authed]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [data?.chat]);

  function sendCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!consoleCmd.trim()) return;
    const ts = new Date().toLocaleTimeString("id-ID");
    setConsoleLogs((prev) => [
      ...prev,
      `[${ts}] > ${consoleCmd}`,
      `[${ts}] Command executed (demo mode)`,
    ]);
    setConsoleCmd("");
  }

  const server = data?.server;
  const players = data?.players ?? [];
  const metrics = data?.metrics;
  const online = players.filter((p) => p.online);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="pixel-border p-8 w-full max-w-sm" style={{ background: "#111" }}>
          <div className="text-center mb-6">
            <div className="text-[10px] font-display text-[#FFD700] mb-2">MC PANEL</div>
            <div className="text-xs font-mono text-[#555]">ADMIN ACCESS</div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-[#555] block mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D0D0D] pixel-border px-3 py-2 text-sm font-mono text-[#E8E8E8] outline-none focus:border-[#5EDFFF] transition-colors"
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            {error && <div className="text-[10px] font-mono text-red-500">{error}</div>}
            <button
              type="submit"
              className="w-full pixel-border-green py-2 text-[11px] font-mono text-[#4CAF50] hover:bg-[#4CAF5015] transition-colors"
            >
              LOGIN →
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-[10px] font-mono text-[#444] hover:text-[#666]">
              ← Kembali ke Public
            </Link>
          </div>
          <div className="mt-2 text-center text-[9px] font-mono text-[#2A2A2A]">
            demo: admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* Admin Header */}
      <header
        className="sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between"
        style={{ background: "#0D0D0D", borderBottom: "1px solid #1E1E1E" }}
      >
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-display text-[#FFD700]">ADMIN</div>
          <div className="w-px h-6 bg-[#222]" />
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 status-dot-online" : "bg-red-500"}`} />
            <span className="text-[9px] font-mono text-[#555]">
              {connected ? `LIVE · ${server?.playerCount ?? 0} online` : "RECONECTING..."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["overview", "players", "chat", "console"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-[9px] font-mono px-2.5 py-1 transition-colors"
              style={{
                color: activeTab === tab ? "#FFD700" : "#555",
                background: activeTab === tab ? "#1C1C1C" : "transparent",
                border: activeTab === tab ? "1px solid #333" : "1px solid transparent",
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
          <div className="w-px h-5 bg-[#222] mx-1" />
          <Link href="/" className="text-[9px] font-mono text-[#444] hover:text-[#666] px-2">
            PUBLIC ↗
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "TPS", value: server?.tps.toFixed(1) ?? "—", color: server && server.tps >= 18 ? "#4CAF50" : "#FFD700" },
                { label: "CPU", value: `${server?.cpu ?? 0}%`, color: "#5EDFFF" },
                { label: "RAM", value: `${server?.ram ?? 0}M`, color: "#FFD700" },
                { label: "PLAYERS", value: `${server?.playerCount ?? 0}/${server?.maxPlayers ?? 20}`, color: "#4CAF50" },
              ].map((s) => (
                <div key={s.label} className="pixel-border p-3" style={{ background: "#111" }}>
                  <div className="text-[9px] text-[#444] font-mono">{s.label}</div>
                  <div className="text-xl font-bold font-mono mt-0.5" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-3">
              <MetricChart data={tpsHistory.current} label="TPS History" color="#4CAF50" min={0} max={20} />
              <MetricChart data={cpuHistory.current} label="CPU % History" color="#5EDFFF" min={0} max={100} />
              <MetricChart data={ramHistory.current} label="RAM MB History" color="#FFD700" min={0} max={4096} />
            </div>

            {/* Server Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="pixel-border p-4" style={{ background: "#111" }}>
                <div className="text-[9px] text-[#444] font-mono mb-3 uppercase tracking-widest">Server Config</div>
                <div className="space-y-2">
                  {[
                    ["Mode", server?.gamemode ?? "—"],
                    ["Difficulty", server?.difficulty ?? "—"],
                    ["PvP", server?.pvp ? "Aktif" : "Off"],
                    ["Whitelist", server?.whitelist ? "Aktif" : "Off"],
                    ["Version", server?.version ?? "—"],
                    ["Cuaca", metrics?.weather ?? "—"],
                    ["Waktu", `${metrics?.dayTime ?? 0} tick`],
                    ["Chunks Loaded", String(metrics?.chunksLoaded ?? "—")],
                    ["Entities", String(metrics?.entitiesLoaded ?? "—")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-[10px] text-[#444] font-mono">{k}</span>
                      <span className="text-[10px] text-[#E8E8E8] font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pixel-border p-4" style={{ background: "#111" }}>
                <div className="text-[9px] text-[#444] font-mono mb-3 uppercase tracking-widest">Resource Usage</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-[#444]">CPU</span>
                      <span style={{ color: "#5EDFFF" }}>{server?.cpu ?? 0}%</span>
                    </div>
                    <Bar value={server?.cpu ?? 0} max={100} color="#5EDFFF" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-[#444]">RAM</span>
                      <span style={{ color: "#FFD700" }}>{server?.ram ?? 0} / {server?.maxRam ?? 4096} MB</span>
                    </div>
                    <Bar value={server?.ram ?? 0} max={server?.maxRam ?? 4096} color="#FFD700" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-[#444]">TPS</span>
                      <span style={{ color: "#4CAF50" }}>{server?.tps.toFixed(1) ?? 0} / 20</span>
                    </div>
                    <Bar value={server?.tps ?? 0} max={20} color="#4CAF50" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-[#444]">Slot Player</span>
                      <span style={{ color: "#E8E8E8" }}>{server?.playerCount ?? 0} / {server?.maxPlayers ?? 20}</span>
                    </div>
                    <Bar value={server?.playerCount ?? 0} max={server?.maxPlayers ?? 20} color="#8BC34A" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="pixel-border p-4" style={{ background: "#111" }}>
              <div className="text-[9px] text-[#444] font-mono mb-3 uppercase tracking-widest">Quick Actions</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Restart Server", color: "#F44336" },
                  { label: "Save World", color: "#4CAF50" },
                  { label: "Broadcast", color: "#FFD700" },
                  { label: "Backup", color: "#5EDFFF" },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() =>
                      setConsoleLogs((prev) => [
                        ...prev,
                        `[Admin] Clicked: ${a.label} (demo)`,
                      ])
                    }
                    className="pixel-border py-2 text-[10px] font-mono hover:opacity-80 transition-opacity"
                    style={{ color: a.color, borderColor: a.color + "44" }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLAYERS TAB */}
        {activeTab === "players" && (
          <div className="space-y-3">
            <div className="flex gap-2 text-[10px] font-mono text-[#444]">
              <span className="text-[#4CAF50]">{online.length} online</span>
              <span>·</span>
              <span>{players.length - online.length} offline</span>
              <span>·</span>
              <span>{players.length} total</span>
            </div>

            {players.map((p) => (
              <div
                key={p.id}
                className="pixel-border"
                style={{ background: "#111", opacity: p.online ? 1 : 0.6 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-xs font-bold font-mono pixel-border"
                      style={{ background: "#1A1A1A", color: p.isOp ? "#FFD700" : "#5EDFFF" }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-[#E8E8E8]">{p.name}</span>
                        {p.isOp && (
                          <span className="text-[9px] px-1 py-0.5 border font-mono" style={{ color: "#FFD700", borderColor: "#FFD70044" }}>
                            OP
                          </span>
                        )}
                        <span
                          className="text-[9px] font-mono"
                          style={{ color: p.online ? "#4CAF50" : "#555" }}
                        >
                          {p.online ? "● ONLINE" : "○ OFFLINE"}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#444] font-mono">{p.uuid}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["Kick", "Ban", "TP", "OP"].map((action) => (
                      <button
                        key={action}
                        className="text-[9px] font-mono px-1.5 py-0.5 border border-[#2A2A2A] text-[#555] hover:text-[#E8E8E8] hover:border-[#444] transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3">
                  <div>
                    <div className="text-[9px] text-[#444] font-mono mb-1">HEALTH</div>
                    <HeartIcons health={p.health} />
                    <div className="text-[9px] text-[#F44336] font-mono mt-0.5">{p.health} / 20</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#444] font-mono mb-1">HUNGER</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className="text-[8px]" style={{ color: p.hunger / 2 > i ? "#FF9800" : "#2A2A2A" }}>
                          🍗
                        </span>
                      ))}
                    </div>
                    <div className="text-[9px] text-[#FF9800] font-mono mt-0.5">{p.hunger} / 20</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#444] font-mono mb-1">XP</div>
                    <Bar value={p.xp} max={2000} color="#7CB342" />
                    <div className="text-[9px] text-[#7CB342] font-mono mt-0.5">{p.xp} xp</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#444] font-mono mb-1">LOKASI</div>
                    <div className="text-[9px] text-[#E8E8E8] font-mono">{p.world}</div>
                    <div className="text-[9px] text-[#555] font-mono">X:{p.x} Y:{p.y} Z:{p.z}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="pixel-border" style={{ background: "#111" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A1A1A]">
              <span className="text-[9px] font-mono text-[#555]">LIVE CHAT MONITOR</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot-online" />
                <span className="text-[9px] font-mono text-[#444]">LIVE</span>
              </div>
            </div>
            <div
              ref={chatRef}
              className="h-[500px] overflow-y-auto py-2 font-mono"
              style={{ background: "#0A0A0A" }}
            >
              {(data?.chat ?? []).map((entry) => (
                <ChatLine key={entry.id + entry.timestamp} entry={entry} />
              ))}
              {!data && (
                <div className="px-4 py-4 text-[10px] text-[#333] font-mono">Menghubungkan...</div>
              )}
            </div>
            <div className="border-t border-[#1A1A1A] p-3">
              <div className="flex gap-2 text-[10px] font-mono text-[#333]">
                <span style={{ color: "#4CAF50" }}>■ chat</span>
                <span style={{ color: "#4CAF50" }}>■ join</span>
                <span style={{ color: "#F44336" }}>■ leave</span>
                <span style={{ color: "#FF9800" }}>■ death</span>
                <span style={{ color: "#FFD700" }}>■ achievement</span>
              </div>
            </div>
          </div>
        )}

        {/* CONSOLE TAB */}
        {activeTab === "console" && (
          <div className="pixel-border" style={{ background: "#111" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A1A1A]">
              <span className="text-[9px] font-mono text-[#555]">SERVER CONSOLE</span>
              <span className="text-[9px] font-mono text-[#333]">demo mode</span>
            </div>
            <div
              className="h-[400px] overflow-y-auto p-3 space-y-0.5 font-mono text-[10px]"
              style={{ background: "#080808" }}
            >
              {consoleLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes("[Server]") ? "#4CAF50" : log.includes("[Admin]") ? "#FFD700" : "#E8E8E8" }}>
                  {log}
                </div>
              ))}
              <div className="animate-blink text-[#4CAF50]">_</div>
            </div>
            <form onSubmit={sendCommand} className="border-t border-[#1A1A1A] p-3 flex gap-2">
              <span className="text-[11px] font-mono text-[#4CAF50] self-center">{">"}</span>
              <input
                value={consoleCmd}
                onChange={(e) => setConsoleCmd(e.target.value)}
                className="flex-1 bg-transparent text-[11px] font-mono text-[#E8E8E8] outline-none"
                placeholder="ketik command..."
              />
              <button
                type="submit"
                className="text-[9px] font-mono px-3 py-1 pixel-border text-[#4CAF50] hover:bg-[#4CAF5015] transition-colors"
              >
                SEND
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
