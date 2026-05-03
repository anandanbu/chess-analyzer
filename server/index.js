  const express = require("express");
const cors = require("cors");

const { getUserGames } = require("./services/chessService");
const { parseGame } = require("./utils/pgnParser");
const { analyzeGames } = require("./utils/analyzer");

const PDFDocument = require("pdfkit");

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API Running");
});

// ANALYZE ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { username } = req.body;

    const games = await getUserGames(username);
    const parsed = games.map(g => parseGame(g, username)).filter(Boolean);
    const analysis = analyzeGames(parsed);

    res.json({ username, ...analysis });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PDF ROUTE (FINAL FIXED VERSION)
app.post("/generate-pdf", async (req, res) => {
  try {
    const data = req.body;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${data.username || "report"}.pdf`
    );

    const doc = new PDFDocument();

    // Pipe directly to response (BEST PRACTICE)
    doc.pipe(res);

    // ===== CONTENT =====
    doc.fontSize(20).text("Chess Analyzer Report", { align: "center" });

    doc.moveDown();
    doc.fontSize(14).text(`Username: ${data.username || "N/A"}`);
    doc.text(`Total Games: ${data.totalGames || 0}`);

    doc.moveDown();
    doc.text("Overall Best:");
    doc.text(data.overall?.best?.name || "N/A");

    doc.text("Overall Worst:");
    doc.text(data.overall?.worst?.name || "N/A");

    doc.moveDown();
    doc.text("As White Best:");
    doc.text(data.white?.best?.name || "N/A");

    doc.text("As White Worst:");
    doc.text(data.white?.worst?.name || "N/A");

    doc.moveDown();
    doc.text("As Black Best:");
    doc.text(data.black?.best?.name || "N/A");

    doc.text("As Black Worst:");
    doc.text(data.black?.worst?.name || "N/A");

    // FINALIZE PDF
    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});