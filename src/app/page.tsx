"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ServerData {
  timestamp: number;
  server: {
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
    difficulty: string;
    gamemode: string;
    pvp: boolean;
    whitelist: boolean;
  };
  players: {
    name: string;
    online: boolean;
    playtime: number;
    world: string;
    isOp: boolean;
    joinedAt?: string;
  }[];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatPlaytime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

function TPSBar({ tps }: { tps: number }) {
  const pct = (tps / 20) * 100;
  const color = tps >= 18 ? "#4CAF50" : tps >= 14 ? "#FFD700" : "#F44336";
  return (
    <div className="w-full h-2 bg-[#2A2A2A] rounded-none overflow-hidden" style={{ imageRendering: "pixelated" }}>
      <div
        className="h-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function MiniPixelIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    sword: "⚔",
    diamond: "💎",
    creeper: "👾",
    heart: "❤",
    op: "⭐",
    world: "🌍",
    nether: "🔥",
    end: "🌌",
  };
  return <span className="text-xs">{icons[type] || "▪"}</span>;
}

function StatCard({
  label,
  value,
  sub,
  accent,
  bar,
  barPct,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  bar?: boolean;
  barPct?: number;
}) {
  return (
    <div
      className="pixel-border p-3 flex flex-col gap-1"
      style={{ background: "#141414" }}
    >
      <span className="text-[10px] text-[#666] uppercase tracking-widest font-mono">{label}</span>
      <span
        className="text-lg font-bold font-mono"
        style={{ color: accent || "#E8E8E8" }}
      >
        {value}
      </span>
      {sub && <span className="text-[10px] text-[#555] font-mono">{sub}</span>}
      {bar && typeof barPct === "number" && (
        <div className="w-full h-1.5 bg-[#2A2A2A] mt-1">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${barPct}%`,
              background: barPct > 80 ? "#F44336" : barPct > 60 ? "#FFD700" : "#4CAF50",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function PublicDashboard() {
  const [data, setData] = useState<ServerData | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/server-status");
      esRef.current = es;

      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        setData(JSON.parse(e.data));
        setLastUpdate(new Date());
        setTick((t) => t + 1);
      };
      es.onerror = () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 3000);
      };
    }
    connect();
    return () => esRef.current?.close();
  }, []);

  const online = data?.players.filter((p) => p.online) ?? [];
  const server = data?.server;

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* Header */}
      <header
        className="pixel-border-green sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: "#0D0D0D", borderLeft: 0, borderRight: 0, borderTop: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-display text-[#4CAF50] tracking-tight leading-tight">
            MC<br />PANEL
          </div>
          <div className="w-px h-8 bg-[#2A2A2A]" />
          <div>
            <div className="text-[10px] text-[#555] font-mono">PUBLIC VIEW</div>
            <div className="text-xs text-[#E8E8E8] font-mono">play.myserver.net</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 status-dot-online" : "bg-red-500"}`}
            />
            <span className="text-[10px] font-mono text-[#666]">
              {connected ? "LIVE" : "DISCONNECTED"}
            </span>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-mono px-3 py-1.5 pixel-border text-[#5EDFFF] hover:bg-[#5EDFFF15] transition-colors"
          >
            ADMIN →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Server Status Hero */}
        <div className="pixel-border p-5" style={{ background: "#111" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 status-dot-online" />
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: "#4CAF50" }}
                >
                  SERVER ONLINE
                </span>
              </div>
              <h1 className="text-base font-display text-[#E8E8E8] leading-tight">
                Survival World
              </h1>
              <p className="text-[10px] text-[#555] font-mono mt-1">
                Minecraft {server?.version ?? "..."} &nbsp;•&nbsp; {server?.difficulty ?? "..."} &nbsp;•&nbsp; PvP {server?.pvp ? "ON" : "OFF"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono" style={{ color: "#5EDFFF" }}>
                {server?.playerCount ?? 0}
                <span className="text-sm text-[#555]">/{server?.maxPlayers ?? 20}</span>
              </div>
              <div className="text-[10px] text-[#555] font-mono">players online</div>
            </div>
          </div>

          {/* Player capacity bar */}
          <div className="w-full h-3 bg-[#1A1A1A] pixel-border overflow-hidden mb-1">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${((server?.playerCount ?? 0) / (server?.maxPlayers ?? 20)) * 100}%`,
                background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-[#444] font-mono">
            <span>0</span>
            <span>{server?.maxPlayers ?? 20} slots</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="TPS"
            value={server?.tps.toFixed(1) ?? "—"}
            sub="20.0 = perfect"
            accent={!server ? "#666" : server.tps >= 18 ? "#4CAF50" : server.tps >= 14 ? "#FFD700" : "#F44336"}
          />
          <StatCard
            label="CPU"
            value={`${server?.cpu ?? 0}%`}
            bar
            barPct={server?.cpu ?? 0}
            accent="#5EDFFF"
          />
          <StatCard
            label="RAM"
            value={`${server?.ram ?? 0} MB`}
            sub={`dari ${server?.maxRam ?? 4096} MB`}
            bar
            barPct={((server?.ram ?? 0) / (server?.maxRam ?? 4096)) * 100}
            accent="#FFD700"
          />
          <StatCard
            label="UPTIME"
            value={formatUptime(server?.uptime ?? 0)}
            sub="sejak restart"
            accent="#4CAF50"
          />
        </div>

        {/* TPS Detail */}
        <div className="pixel-border p-4" style={{ background: "#111" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#555] font-mono uppercase tracking-widest">Tick Rate (TPS)</span>
            <span
              className="text-sm font-bold font-mono"
              style={{ color: server && server.tps >= 18 ? "#4CAF50" : server && server.tps >= 14 ? "#FFD700" : "#F44336" }}
            >
              {server?.tps.toFixed(1) ?? "0"} / 20
            </span>
          </div>
          <TPSBar tps={server?.tps ?? 0} />
          <div className="flex justify-between text-[9px] text-[#333] font-mono mt-1">
            <span>LAG</span>
            <span className="text-yellow-700">OK</span>
            <span className="text-green-800">PERFECT</span>
          </div>
        </div>

        {/* Online Players */}
        <div className="pixel-border" style={{ background: "#111" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E]">
            <span className="text-xs font-mono text-[#E8E8E8] uppercase tracking-widest">
              Player Online ({online.length})
            </span>
            <span className="text-[9px] font-mono text-[#444]">
              update {lastUpdate?.toLocaleTimeString("id-ID") ?? "—"}
            </span>
          </div>

          {online.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#444] font-mono text-xs">
              Tidak ada player online
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {online.map((p) => (
                <div key={p.name} className="flex items-center justify-between px-4 py-3 hover:bg-[#151515] transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Pixel avatar */}
                    <div
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold font-mono pixel-border"
                      style={{
                        background: "#1C1C1C",
                        color: p.isOp ? "#FFD700" : "#5EDFFF",
                      }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-[#E8E8E8]">{p.name}</span>
                        {p.isOp && (
                          <span className="text-[9px] font-mono px-1 py-0.5 bg-yellow-900/30 text-yellow-500 border border-yellow-900">
                            OP
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#444] font-mono">
                        {p.world} &nbsp;•&nbsp; {formatPlaytime(p.playtime)} dimainkan
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#555] font-mono">
                      {p.joinedAt
                        ? `online ${Math.floor((Date.now() - new Date(p.joinedAt).getTime()) / 60000)}m`
                        : ""}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: "#4CAF50" }}>● ONLINE</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Server Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="pixel-border p-4" style={{ background: "#111" }}>
            <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest mb-3">Info Server</div>
            <div className="space-y-2">
              {[
                ["IP", "play.myserver.net"],
                ["Port", "25565"],
                ["Versi", server?.version ?? "..."],
                ["Mode", server?.gamemode ?? "Survival"],
                ["Difficulty", server?.difficulty ?? "Normal"],
                ["Whitelist", server?.whitelist ? "Aktif" : "Tidak Aktif"],
                ["PvP", server?.pvp ? "Aktif" : "Tidak Aktif"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs font-mono">
                  <span className="text-[#555]">{k}</span>
                  <span className="text-[#E8E8E8]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pixel-border p-4" style={{ background: "#111" }}>
            <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest mb-3">Top Player</div>
            <div className="space-y-2">
              {(data?.players ?? [])
                .sort((a, b) => b.playtime - a.playtime)
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] w-4 text-center"
                        style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#444" }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: p.online ? "#E8E8E8" : "#555" }}>{p.name}</span>
                      {p.online && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                    </div>
                    <span className="text-[#555]">{formatPlaytime(p.playtime)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[9px] font-mono text-[#333]">
            REALTIME UPDATE SETIAP 3 DETIK &nbsp;•&nbsp; DATA LANGSUNG DARI SERVER
          </p>
        </div>
      </main>
    </div>
  );
}
