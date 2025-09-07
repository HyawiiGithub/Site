import express from "express";
import fetch from "node-fetch";
import { useState, useEffect } from "react";

// ---------------- CONFIG ----------------
const UNIVERSE_ID = "5502317457";
const ROBLOX_API_URL = `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`;
const GAME_STATS_URL = "/api/roblox/game-stats"; // frontend hits this
const PORT = process.env.PORT || 3001;

// ---------------- BACKEND ----------------
const app = express();

app.get("/api/roblox/game-stats", async (req, res) => {
  console.log("[BACKEND] Incoming request for game stats");
  try {
    console.log("[BACKEND] Fetching from Roblox:", ROBLOX_API_URL);
    const response = await fetch(ROBLOX_API_URL);
    const data = await response.json();
    console.log("[BACKEND] Roblox response:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    console.error("[BACKEND] Error fetching Roblox data:", err);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[BACKEND] Proxy server running at http://localhost:${PORT}`);
    console.log(`[BACKEND] Endpoint available at http://localhost:${PORT}${GAME_STATS_URL}`);
  });
}

// ---------------- FRONTEND HOOK ----------------
export function useGameStats() {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const fetchGameStats = async () => {
      console.log("[FRONTEND] Fetching game stats from:", GAME_STATS_URL);
      try {
        const response = await fetch(GAME_STATS_URL);
        console.log("[FRONTEND] Response status:", response.status);
        const data = await response.json();
        console.log("[FRONTEND] Data received:", data);

        if (data.data && data.data.length > 0) {
          const gameData = data.data[0];
          console.log("[FRONTEND] Parsed gameData:", gameData);
          setPlayerCount(gameData.playing || 0);
          setVisits(gameData.visits || 0);
        } else {
          console.warn("[FRONTEND] No game data in response");
          setPlayerCount(0);
          setVisits(0);
        }
      } catch (error) {
        console.error("[FRONTEND] Failed to fetch game stats:", error);
        setPlayerCount(null);
        setVisits(null);
      }
    };

    fetchGameStats();
    const interval = setInterval(fetchGameStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { playerCount, visits };
}
