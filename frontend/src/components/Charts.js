import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

function Charts({ data }) {

  // SAFETY CHECK
  if (!data || !data.overall || !data.overall.openings) {
    return <p>No chart data available</p>;
  }

  const chartData = Object.entries(data.overall.openings).map(
    ([name, stats]) => ({
      name,
      wins: stats.win,
      losses: stats.loss
    })
  );

  return (
    <div>
      <h3>Overall Opening Performance</h3>

      <BarChart width={700} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="wins" />
        <Bar dataKey="losses" />
      </BarChart>
    </div>
  );
}

export default Charts;