// components/Overview/PerformanceChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const PerformanceChart = ({ data }: { data: any[] }) => (
  <div className="card">
    <div className="card-header">
      <h2 className="card-title">Model Performance Over Time</h2>
    </div>
    <div className="chart-container" style={{ height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
           {/* All your Chart Logic here */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);