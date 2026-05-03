import { useState } from "react";
import axios from "axios";
import Charts from "./components/Charts";

function App() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Analyze Profile
  const analyze = async () => {
    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/analyze", {
        username
      });

      setData(res.data);
    } catch (err) {
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!data) return;

    const html = `
      <h1>${data.username} Report</h1>
      <p>Total Games: ${data.totalGames}</p>

      <h2>Overall</h2>
      <p>Best: ${data.overall.best?.name || "N/A"}</p>
      <p>Worst: ${data.overall.worst?.name || "N/A"}</p>

      <h2>As White</h2>
      <p>Best: ${data.white.best?.name || "N/A"}</p>
      <p>Worst: ${data.white.worst?.name || "N/A"}</p>

      <h2>As Black</h2>
      <p>Best: ${data.black.best?.name || "N/A"}</p>
      <p>Worst: ${data.black.worst?.name || "N/A"}</p>

      <h2>Against e4</h2>
      <p>Best: ${data.vsE4.best?.name || "N/A"}</p>

      <h2>Against d4</h2>
      <p>Best: ${data.vsD4.best?.name || "N/A"}</p>
    `;

    try {
      const res = await axios.post(
        "https://chess-analyzer-backend-n1a9.onrender.com/generate-pdf",
        { html },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.username}_report.pdf`;
      link.click();
    } catch (err) {
      alert("Error generating PDF");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Chess Analyzer</h1>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Chess.com username"
      />

      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Profile"}
      </button>

      {data && (
        <>
          <h2>{data.username}</h2>
          <p>Total Games: {data.totalGames}</p>

          <hr />

          <h3>📊 Overall</h3>
          <p>Best Opening: {data.overall.best?.name || "N/A"}</p>
          <p>Worst Opening: {data.overall.worst?.name || "N/A"}</p>

          <h3>♔ As White</h3>
          <p>Best Opening: {data.white.best?.name || "N/A"}</p>
          <p>Worst Opening: {data.white.worst?.name || "N/A"}</p>

          <h3>♚ As Black</h3>
          <p>Best Opening: {data.black.best?.name || "N/A"}</p>
          <p>Worst Opening: {data.black.worst?.name || "N/A"}</p>

          <h3>⚔ Against e4</h3>
          <p>Best Defense: {data.vsE4.best?.name || "N/A"}</p>

          <h3>⚔ Against d4</h3>
          <p>Best Defense: {data.vsD4.best?.name || "N/A"}</p>

          <hr />

          <Charts data={data} />

          <br />
          <button onClick={downloadPDF}>
            Download PDF Report
          </button>
        </>
      )}
    </div>
  );
}

export default App;