import express from "express";
import fetch from "node-fetch";
import { useState, useEffect } from "react";

const UNIVERSE_ID = "5502317457";
const ROBLOX_API_URL = `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`;

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/roblox/game-stats", async (req, res) => {
  try {
    const response = await fetch(ROBLOX_API_URL);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend proxy running on http://localhost:${PORT}`);
  });
}

// -------------------- Frontend Hook --------------------
const GAME_STATS_URL = "/api/roblox/game-stats";

export function useGameStats() {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const response = await fetch(GAME_STATS_URL);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const gameData = data.data[0];
          setPlayerCount(gameData.playing || 0);
          setVisits(gameData.visits || 0);
        }
      } catch (error) {
        console.error("Failed to fetch game stats:", error);
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
