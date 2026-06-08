import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function Charts({ data }) {
  // SAFETY CHECK
  if (!data || !data.overall || !data.overall.openings) {
    return <div className="insights-empty">No chart data available</div>;
  }

  const chartData = Object.entries(data.overall.openings)
    .filter(([, stats]) => stats.total >= 3)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15)
    .map(([name, stats]) => ({
      name: name.length > 20 ? name.substring(0, 17) + "..." : name,
      wins: stats.win || 0,
      losses: stats.loss || 0,
      draws: stats.draw || 0
    }));

  return (
    <div className="charts-container">
      <h3>Opening Performance Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e48" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ background: "#1a1a2e", border: "1px solid #2e2e48", borderRadius: "8px" }}
            labelStyle={{ color: "#f0f0f8" }}
          />
          <Bar dataKey="wins" fill="#00d68f" />
          <Bar dataKey="losses" fill="#ff4757" />
          <Bar dataKey="draws" fill="#9898b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Charts;
