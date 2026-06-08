import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import Charts from "./components/Charts";
import InsightsPanel from "./components/InsightsPanel";
import LoadingScreen from "./components/LoadingScreen";

const API_URL = process.env.REACT_APP_API_URL || "https://chess-analyzer-backend.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axios.post(`${API_URL}/analyze`, {
        username: username.trim()
      });
      setData(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 404
          ? "User not found on Chess.com. Check the username."
          : "Backend is starting up (Render free tier). Please wait 30 seconds and try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    setPdfLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/generate-pdf`,
        data,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${data.username}-chess-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Background chess pattern */}
      <div className="bg-pattern" aria-hidden="true">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={`chess-square ${(Math.floor(i / 8) + i) % 2 === 0 ? "light" : "dark"}`}
          />
        ))}
      </div>

      {/* Floating chess pieces decoration */}
      <div className="floating-pieces" aria-hidden="true">
        {["♟", "♜", "♝", "♞", "♛", "♚", "♙", "♖"].map((p, i) => (
          <span key={i} className={`piece piece-${i}`}>{p}</span>
        ))}
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">♟</span>
            <div className="logo-text">
              <span className="logo-title">Chess</span>
              <span className="logo-subtitle">Analyzer</span>
            </div>
          </div>
          <nav className="header-nav">
            <span className="nav-badge">Chess.com Stats</span>
          </nav>
        </div>
      </header>

      <main className="main">
        {/* HERO */}
        {!data && !loading && (
          <section className="hero">
            <div className="hero-tag">Opening Performance Analysis</div>
            <h1 className="hero-title">
              Decode Your <span className="accent">Chess DNA</span>
            </h1>
            <p className="hero-sub">
              Analyze your last 6 months of Chess.com games. Discover your best
              and worst openings, performance trends, and get a full PDF report.
            </p>
          </section>
        )}

        {/* SEARCH FORM */}
        <section className="search-section">
          <form className="search-form" onSubmit={handleAnalyze}>
            <div className="input-group">
              <span className="input-icon">♟</span>
              <input
                className="search-input"
                type="text"
                placeholder="Enter Chess.com username…"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                className="search-btn"
                type="submit"
                disabled={loading || !username.trim()}
              >
                {loading ? <span className="spinner" /> : "Analyze"}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* LOADING */}
        {loading && <LoadingScreen username={username} />}

        {/* RESULTS */}
        {data && !loading && (
          <section className="results">
            {/* Results header */}
            <div className="results-header">
              <div className="results-title-group">
                <h2 className="results-title">
                  <span className="accent">{data.username}</span>'s Analysis
                </h2>
                <span className="games-badge">{data.totalGames} games</span>
              </div>
              <button
                className={`pdf-btn ${pdfLoading ? "loading" : ""}`}
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <><span className="spinner" /> Generating…</>
                ) : (
                  <><span>⬇</span> Download PDF Report</>
                )}
              </button>
            </div>

            {/* TABS */}
            <div className="tabs">
              {[
                { id: "overview", label: "Overview", icon: "◈" },
                { id: "white",    label: "As White", icon: "♔" },
                { id: "black",    label: "As Black",  icon: "♚" },
                { id: "charts",   label: "Charts",    icon: "▦" },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="tab-content">
              {activeTab === "overview" && (
                <InsightsPanel data={data} view="overview" />
              )}
              {activeTab === "white" && (
                <InsightsPanel data={data} view="white" />
              )}
              {activeTab === "black" && (
                <InsightsPanel data={data} view="black" />
              )}
              {activeTab === "charts" && (
                <Charts data={data} />
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Chess Analyzer • Data from Chess.com API • Made by <strong>Anandanbu</strong></p>
      </footer>
    </div>
  );
}

export default App;
