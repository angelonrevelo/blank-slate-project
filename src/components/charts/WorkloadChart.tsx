import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkloadChartProps {
  data: { doctor: string; count: number }[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Staff Workload Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="doctor" type="category" />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(160, 100%, 40%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
