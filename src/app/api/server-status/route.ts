export const runtime = "nodejs";
import { NextRequest } from "next/server";
import { getServerStatus, getPlayers } from "@/lib/serverData";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send() {
        const status = getServerStatus();
        const players = getPlayers();
        const tpsNoise = Math.sin(Date.now() / 8000) * 0.6;
        const cpuNoise = Math.sin(Date.now() / 12000) * 15;
        const ramNoise = Math.sin(Date.now() / 15000) * 150;

        const data = {
          timestamp: Date.now(),
          server: {
            ...status,
            tps: parseFloat(Math.max(15, Math.min(20, status.tps + tpsNoise)).toFixed(1)),
            cpu: Math.max(5, Math.min(90, Math.floor(status.cpu + cpuNoise))),
            ram: Math.max(1024, Math.min(3800, Math.floor(status.ram + ramNoise))),
          },
          players: players.map(p => ({
            name: p.name,
            online: p.online,
            playtime: p.playtime,
            world: p.world,
            isOp: p.isOp,
            joinedAt: p.joinedAt,
          })),
        };

        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      }

      send();
      const interval = setInterval(send, 3000);

      // Cleanup
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
