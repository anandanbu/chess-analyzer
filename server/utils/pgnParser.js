const { Chess } = require("chess.js");
const ecoMap = require("./ecoMap");

function parseGame(game, username) {
  try {
    if (!game.pgn) return null;

    const chess = new Chess();
    chess.loadPgn(game.pgn);

    const moves = chess.history();

    // Determine player's color
    const playerColor =
      game.white &&
      game.white.username &&
      game.white.username.toLowerCase() === username.toLowerCase()
        ? "white"
        : "black";

    // Determine result
    let result = "draw";

    if (game.white && game.white.result === "win") {
      result = playerColor === "white" ? "win" : "loss";
    } else if (game.black && game.black.result === "win") {
      result = playerColor === "black" ? "win" : "loss";
    }

    return {
      opening: extractOpening(game.pgn),
      moves: moves.length,
      result,
      color: playerColor,
      firstMove: getFirstMove(game.pgn)
    };

  } catch (err) {
    return null;
  }
}

function extractOpening(pgn) {
  // Try actual opening name first
  const openingMatch = pgn.match(/\[Opening "([^"]+)"\]/);
  if (openingMatch) return openingMatch[1];

  // Fallback to ECO → mapped name
  const ecoMatch = pgn.match(/\[ECO "([^"]+)"\]/);
  if (ecoMatch) {
    const eco = ecoMatch[1];

    if (ecoMap[eco]) return ecoMap[eco];

    if (eco.startsWith("B")) return "Semi-Open Game";
    if (eco.startsWith("C")) return "Open Game";
    if (eco.startsWith("D")) return "Queen's Pawn Game";
    if (eco.startsWith("E")) return "Indian Defense";
    if (eco.startsWith("A")) return "Flank Opening";

    return `ECO ${eco}`;
  }

  return "Unknown";
}

function getFirstMove(pgn) {
  const match = pgn.match(/1\.\s*([^\s{]+)/);
  return match ? match[1].toLowerCase() : null;
}

module.exports = { parseGame };
