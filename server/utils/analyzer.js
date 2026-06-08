function analyzeGames(games) {

  function analyzeByOpening(gamesList) {
    const openings = {};

    gamesList.forEach(g => {
      if (!g.opening) return;
      if (!openings[g.opening]) {
        openings[g.opening] = { win: 0, loss: 0, draw: 0, total: 0, winRate: 0 };
      }
      openings[g.opening][g.result]++;
      openings[g.opening].total++;
    });

    Object.keys(openings).forEach(name => {
      const stats = openings[name];
      stats.winRate = stats.total ? stats.win / stats.total : 0;
    });

    return openings;
  }

  const whiteGames = games.filter(g => g.color === "white");
  const blackGames = games.filter(g => g.color === "black");

  // Match e4/d4 more flexibly
  const vsE4 = blackGames.filter(g => g.firstMove && g.firstMove.startsWith("e4"));
  const vsD4 = blackGames.filter(g => g.firstMove && g.firstMove.startsWith("d4"));

  const overall = analyzeByOpening(games);
  const white = analyzeByOpening(whiteGames);
  const black = analyzeByOpening(blackGames);
  const e4 = analyzeByOpening(vsE4);
  const d4 = analyzeByOpening(vsD4);

  function getBestWorst(openings) {
    let best = null;
    let worst = null;

    Object.entries(openings).forEach(([name, stats]) => {
      if (stats.total < 5) return;

      if (!best || stats.winRate > best.rate) {
        best = { name, rate: stats.winRate, games: stats.total };
      }
      if (!worst || stats.winRate < worst.rate) {
        worst = { name, rate: stats.winRate, games: stats.total };
      }
    });

    return { best, worst };
  }

  return {
    totalGames: games.length,
    overall: { openings: overall, ...getBestWorst(overall) },
    white:   { openings: white,   ...getBestWorst(white)   },
    black:   { openings: black,   ...getBestWorst(black)   },
    vsE4:    { openings: e4,      ...getBestWorst(e4)      },
    vsD4:    { openings: d4,      ...getBestWorst(d4)      }
  };
}

module.exports = { analyzeGames };
