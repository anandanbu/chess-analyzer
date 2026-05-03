const express = require("express");
const cors = require("cors");

const { getUserGames } = require("./services/chessService");
const { parseGame } = require("./utils/pgnParser");
const { analyzeGames } = require("./utils/analyzer");
const { generatePDF } = require("./services/pdfService");

const app = express();
app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API Running");
});

// ANALYZE
app.post("/analyze", async (req, res) => {
  try {
    const { username } = req.body;

    const games = await getUserGames(username);

    const parsed = games.map(g => parseGame(g, username)).filter(Boolean);

    const analysis = analyzeGames(parsed);

    res.json({ username, ...analysis });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PDF
app.post("/generate-pdf", async (req, res) => {
  try {
    const html = req.body.html;

    const pdf = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length
    });

    res.send(pdf);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));