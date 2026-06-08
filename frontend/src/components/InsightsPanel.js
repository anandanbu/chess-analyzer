import React from "react";

function InsightsPanel({ data, view }) {
  if (!data) return null;

  // Select data based on view
  const viewData = view === "overview" 
    ? data.overall 
    : view === "white" 
    ? data.white 
    : data.black;

  if (!viewData || !viewData.openings) {
    return <div className="insights-empty">No data available for this view</div>;
  }

  const openingsList = Object.entries(viewData.openings)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  return (
    <div className="insights-panel">
      {/* Best & Worst Openings */}
      <div className="insights-grid">
        {viewData.best && (
          <div className="insight-card best">
            <h4>✓ Best Opening</h4>
            <p className="opening-name">{viewData.best.name}</p>
            <p className="stat">Win Rate: <strong>{(viewData.best.rate * 100).toFixed(1)}%</strong></p>
            <p className="stat">Games: <strong>{viewData.best.games}</strong></p>
          </div>
        )}

        {viewData.worst && (
          <div className="insight-card worst">
            <h4>✗ Worst Opening</h4>
            <p className="opening-name">{viewData.worst.name}</p>
            <p className="stat">Win Rate: <strong>{(viewData.worst.rate * 100).toFixed(1)}%</strong></p>
            <p className="stat">Games: <strong>{viewData.worst.games}</strong></p>
          </div>
        )}
      </div>

      {/* Top Openings List */}
      <div className="openings-table">
        <h3>Top Openings</h3>
        <div className="table-header">
          <div>Opening</div>
          <div>Wins</div>
          <div>Losses</div>
          <div>Draws</div>
          <div>Win%</div>
        </div>

        {openingsList.map(([name, stats], i) => {
          const winPct = stats.total ? ((stats.win / stats.total) * 100).toFixed(1) : "0.0";
          return (
            <div key={i} className="table-row">
              <div className="opening-col">{name}</div>
              <div className="win-col">{stats.win || 0}</div>
              <div className="loss-col">{stats.loss || 0}</div>
              <div className="draw-col">{stats.draw || 0}</div>
              <div className="winrate-col"><strong>{winPct}%</strong></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InsightsPanel;
