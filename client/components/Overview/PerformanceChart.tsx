import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  data: any[];
  lines: string[]; // Receives the unique modelLines array from parent
}

export const PerformanceChart = ({ data, lines }: PerformanceChartProps) => {
  // A clean distinct palette array to cycle colors across changing lines
  const colors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444"];

  return (
    <div className="card mb-6">
      <h2 className="card-title mb-4">NYC Taxi duration Prediction</h2>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" />
            <YAxis stroke="#71717a" domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
            <Legend />
            
            {/* Dynamically draw a unique path line for every model ever introduced! */}
            {lines.map((lineId, index) => {
              // 1. Safe fallback to avoid calling .toString() or .replace() on undefined/null variants
              const safeDataKey = lineId || `unknown-model-${index}`;
              
              // 2. Sanitize spaces/parentheses out of the structural component key for React's virtual DOM reconciliation
              const safeReactKey = `line-${index}-${safeDataKey.toString().replace(/\s+/g, '-')}`;

              return (
                <Line
                  key={safeReactKey}
                  type="monotone"
                  dataKey={safeDataKey} // Explicitly references the key inside your pivoted data object
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true} // Crucial! Keeps line fluid even if model wasn't active on historical dates
                />
              );
            })}

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};