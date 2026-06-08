const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const { getUserGames } = require("./services/chessService");
const { parseGame } = require("./utils/pgnParser");
const { analyzeGames } = require("./utils/analyzer");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10mb" }));

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ status: "Chess Analyzer API Running", version: "1.0.0" });
});

// ANALYZE ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required" });
    }

    const cleanUsername = username.trim();

    const games = await getUserGames(cleanUsername);

    if (!games || games.length === 0) {
      return res.status(404).json({ error: "No games found for this username" });
    }

    const parsed = games
      .map(g => parseGame(g, cleanUsername))
      .filter(Boolean);

    if (parsed.length === 0) {
      return res.status(404).json({ error: "Could not parse any games" });
    }

    const analysis = analyzeGames(parsed);

    res.json({ username: cleanUsername, ...analysis });

  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);

    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: "Chess.com user not found" });
    }

    res.status(500).json({ error: "Failed to analyze games: " + err.message });
  }
});

// PDF REPORT ROUTE
app.post("/generate-pdf", async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.username) {
      return res.status(400).json({ error: "No data provided for PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${data.username}-chess-report.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // ── HEADER ──────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill("#1a1a2e");

    doc
      .fillColor("#e94560")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("♟ Chess Analyzer Report", 50, 30, { align: "center" });

    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, 50, 68, { align: "center" });

    doc.y = 120;

    // ── PLAYER INFO ─────────────────────────────────────────
    doc
      .fillColor("#1a1a2e")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Player Overview", 50, doc.y);

    doc.moveDown(0.4);
    doc
      .rect(50, doc.y, doc.page.width - 100, 1)
      .fill("#e94560");
    doc.moveDown(0.6);

    const playerInfo = [
      ["Username", data.username || "N/A"],
      ["Total Games Analyzed", String(data.totalGames || 0)],
    ];

    playerInfo.forEach(([label, value]) => {
      doc
        .fillColor("#555555")
        .fontSize(11)
        .font("Helvetica")
        .text(label + ":", 50, doc.y, { continued: true, width: 200 });
      doc
        .fillColor("#1a1a2e")
        .font("Helvetica-Bold")
        .text(" " + value);
      doc.moveDown(0.3);
    });

    // ── SECTION HELPER ───────────────────────────────────────
    function drawSection(title, best, worst) {
      doc.moveDown(0.8);

      doc
        .fillColor("#1a1a2e")
        .fontSize(15)
        .font("Helvetica-Bold")
        .text(title, 50, doc.y);

      doc.moveDown(0.3);
      doc
        .rect(50, doc.y, doc.page.width - 100, 1)
        .fill("#e94560");
      doc.moveDown(0.5);

      // Best
      doc
        .rect(50, doc.y, doc.page.width - 100, 44)
        .fill("#f0fff4");

      doc.y += 6;
      doc
        .fillColor("#22863a")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("✓ Best Opening:", 60, doc.y);
      doc
        .fillColor("#1a1a2e")
        .font("Helvetica")
        .text(best ? `${best.name}  (Win rate: ${(best.rate * 100).toFixed(1)}%  |  ${best.games} games)` : "Not enough data", 60, doc.y + 16);

      doc.y += 50;

      // Worst
      doc
        .rect(50, doc.y, doc.page.width - 100, 44)
        .fill("#fff5f5");

      doc.y += 6;
      doc
        .fillColor("#cb2431")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("✗ Worst Opening:", 60, doc.y);
      doc
        .fillColor("#1a1a2e")
        .font("Helvetica")
        .text(worst ? `${worst.name}  (Win rate: ${(worst.rate * 100).toFixed(1)}%  |  ${worst.games} games)` : "Not enough data", 60, doc.y + 16);

      doc.y += 50;
    }

    drawSection("Overall Performance", data.overall?.best, data.overall?.worst);
    drawSection("As White", data.white?.best, data.white?.worst);
    drawSection("As Black", data.black?.best, data.black?.worst);
    drawSection("Against e4", data.vsE4?.best, null);
    drawSection("Against d4", data.vsD4?.best, null);

    // ── TOP OPENINGS TABLE ───────────────────────────────────
    if (data.overall?.openings) {
      doc.moveDown(0.8);
      doc
        .fillColor("#1a1a2e")
        .fontSize(15)
        .font("Helvetica-Bold")
        .text("Top Openings Breakdown", 50, doc.y);

      doc.moveDown(0.3);
      doc
        .rect(50, doc.y, doc.page.width - 100, 1)
        .fill("#e94560");
      doc.moveDown(0.5);

      // Table header
      doc
        .rect(50, doc.y, doc.page.width - 100, 22)
        .fill("#1a1a2e");

      doc
        .fillColor("#ffffff")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Opening", 60, doc.y + 6)
        .text("Wins", 310, doc.y + 6)
        .text("Losses", 360, doc.y + 6)
        .text("Draws", 415, doc.y + 6)
        .text("Win%", 470, doc.y + 6);

      doc.y += 26;

      const sortedOpenings = Object.entries(data.overall.openings)
        .filter(([, s]) => s.total >= 3)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 15);

      sortedOpenings.forEach(([name, stats], i) => {
        const rowY = doc.y;
        if (i % 2 === 0) {
          doc.rect(50, rowY, doc.page.width - 100, 20).fill("#f8f9fa");
        }

        const winPct = stats.total ? ((stats.win / stats.total) * 100).toFixed(1) : "0.0";

        doc
          .fillColor("#1a1a2e")
          .fontSize(9)
          .font("Helvetica")
          .text(name.length > 35 ? name.slice(0, 33) + "…" : name, 60, rowY + 5)
          .fillColor("#22863a").font("Helvetica-Bold")
          .text(String(stats.win || 0), 310, rowY + 5)
          .fillColor("#cb2431")
          .text(String(stats.loss || 0), 360, rowY + 5)
          .fillColor("#555555").font("Helvetica")
          .text(String(stats.draw || 0), 415, rowY + 5)
          .fillColor("#1a1a2e").font("Helvetica-Bold")
          .text(winPct + "%", 470, rowY + 5);

        doc.y += 22;
      });
    }

    // ── FOOTER ───────────────────────────────────────────────
    doc.moveDown(1.5);
    doc
      .rect(50, doc.y, doc.page.width - 100, 1)
      .fill("#e0e0e0");
    doc.moveDown(0.5);
    doc
      .fillColor("#999999")
      .fontSize(9)
      .font("Helvetica")
      .text("Generated by Chess Analyzer • chess.com data • anandanbu.github.io/chess-analyzer", 50, doc.y, { align: "center" });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF generation failed: " + err.message });
    }
  }
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Chess Analyzer server running on port ${PORT}`);
});
