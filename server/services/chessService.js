const axios = require("axios");

async function getUserGames(username) {
  const archivesRes = await axios.get(
    `https://api.chess.com/pub/player/${username}/games/archives`
  );

  const archives = archivesRes.data.archives.slice(-6); // limit recent

  let games = [];

  for (let url of archives) {
    const res = await axios.get(url);
    games.push(...res.data.games);
  }

  return games;
}

module.exports = { getUserGames };