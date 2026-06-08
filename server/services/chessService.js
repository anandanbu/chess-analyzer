const axios = require("axios");

const HEADERS = {
  "User-Agent": "ChessAnalyzer/1.0 (contact: chess-analyzer@example.com)"
};

async function getUserGames(username) {
  const archivesRes = await axios.get(
    `https://api.chess.com/pub/player/${username}/games/archives`,
    { headers: HEADERS, timeout: 15000 }
  );

  if (!archivesRes.data || !archivesRes.data.archives) {
    throw new Error("No archives found for user");
  }

  // Get last 6 months of games
  const archives = archivesRes.data.archives.slice(-6);

  let games = [];

  for (let url of archives) {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      if (res.data && res.data.games) {
        games.push(...res.data.games);
      }
    } catch (err) {
      // Skip failed archive months silently
      console.warn(`Skipped archive ${url}: ${err.message}`);
    }
  }

  return games;
}

module.exports = { getUserGames };
