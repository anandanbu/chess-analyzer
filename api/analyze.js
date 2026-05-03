const { getUserGames } = require("../server/services/chessService");
const { parseGame } = require("../server/utils/pgnParser");
const { analyzeGames } = require("../server/utils/analyzer");

module.exports = async (req, res) => {
  try {
    const { username } = req.body;

    const games = await getUserGames(username);
    const parsed = games.map(g => parseGame(g, username)).filter(Boolean);
    const analysis = analyzeGames(parsed);

    res.json({ username, ...analysis });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};