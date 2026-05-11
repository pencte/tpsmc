export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getServerStatus, getPlayers, getChatLogs } from "@/lib/serverData";

export const dynamic = "force-dynamic";

type ChatEntry = {
  id: string;
  player: string;
  message: string;
  timestamp: number;
  type: string;
};

const chatHistory: ChatEntry[] = [...getChatLogs()];

const playerMessages = [
  "Halo semua!",
  "Ada yang jual diamond gak?",
  "Bisa bantu bikin base?",
  "GG WP",
  "Siapa yang bisa trade emerald?",
  "Server lag gak nih?",
  "Mau PvP siapa berani?",
  "Found a stronghold!",
  "Stack iron siapa mau?",
  "Siap raid nether!",
];

const playerNames = [
  "Notch",
  "Herobrine",
  "Steve",
  "creeper_fan99",
  "DiamondKing_",
];

let chatCounter = chatHistory.length;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (token !== "admin123") {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      async function send() {
        try {
          const status = await getServerStatus();
          const players = getPlayers();

          const tpsNoise = Math.sin(Date.now() / 8000) * 0.6;
          const cpuNoise = Math.sin(Date.now() / 12000) * 15;
          const ramNoise = Math.sin(Date.now() / 15000) * 150;

          if (Math.random() < 0.4) {
            chatCounter++;

            chatHistory.push({
              id: String(chatCounter),
              player:
                playerNames[
                  Math.floor(Math.random() * playerNames.length)
                ],
              message:
                playerMessages[
                  Math.floor(Math.random() * playerMessages.length)
                ],
              timestamp: Date.now(),
              type:
                Math.random() < 0.85
                  ? "chat"
                  : Math.random() < 0.5
                  ? "join"
                  : "leave",
            });

            if (chatHistory.length > 50) {
              chatHistory.shift();
            }
          }

          const data = {
            timestamp: Date.now(),
            server: {
              ...status,
              tps: parseFloat(
                Math.max(
                  15,
                  Math.min(20, status.tps + tpsNoise)
                ).toFixed(1)
              ),
              cpu: Math.max(
                5,
                Math.min(90, Math.floor(status.cpu + cpuNoise))
              ),
              ram: Math.max(
                1024,
                Math.min(3800, Math.floor(status.ram + ramNoise))
              ),
            },
            players,
            chat: chatHistory.slice(-20),
            metrics: {
              chunksLoaded: Math.floor(
                450 + Math.sin(Date.now() / 20000) * 50
              ),
              entitiesLoaded: Math.floor(
                1200 + Math.sin(Date.now() / 18000) * 200
              ),
              dayTime: Math.floor((Date.now() / 1000) % 24000),
              weather:
                Math.sin(Date.now() / 50000) > 0.7
                  ? "rain"
                  : "clear",
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (err) {
          console.error(err);
        }
      }

      send();

      const interval = setInterval(() => {
        send();
      }, 2000);

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
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
