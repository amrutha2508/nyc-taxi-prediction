"use client";
import React, { useState, useEffect } from "react";
import { TrendingDown, Clock, Database, Layers } from "lucide-react";

// Components
import { KPICard } from "@/components/Overview/KPICard";
import { PerformanceChart } from "@/components/Overview/PerformanceChart";
import { IngestionTable } from "@/components/Overview/IngestionTable";
import { apiClient } from "@/lib/api";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";


interface RawMetricRow {
  simulated_date: string;
  rmse: number;
  model_id: string;
  avg_duration_prediction: Timestamp
}

interface ChartTimelinePoint {
  date: string;
  [model: string]: string | number;
}

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<ChartTimelinePoint[]>([]);
  const [modelLines, setModelLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep your mock data intact
  const ingestionHistory = [
    { date: "2024-06-10", dataset: "Jun 2024", status: "Success" },
    { date: "2024-05-10", dataset: "May 2024", status: "Success" },
    { date: "2024-04-10", dataset: "Apr 2024", status: "Success" },
    { date: "2024-01-10", dataset: "Jan 2024", status: "Failed" },
  ];

const fetchMetricsFromBackend = async () => {
    try {
      // apiClient.get directly yields the parsed Array data from your FastAPI backend
      const data: RawMetricRow[] = await apiClient.get("/api/overview/metrics");
      
      if (!data || data.length === 0) return;

      // 1. Map unique model identity lines (e.g., "linear_regression (Production)")
      // .filter(Boolean) ensures no corrupt or undefined entries break Recharts later
      const uniqueLines = Array.from(new Set(data.map(row => row.model_line_id))).filter(Boolean);
      setModelLines(uniqueLines);

      // 2. Pivot database rows into a wide chronological timeline format
      const timelineMap: Record<string, ChartTimelinePoint> = {};

      data.forEach((row) => {
        const dateKey = row.simulated_date;
        if (!timelineMap[dateKey]) {
          timelineMap[dateKey] = { date: dateKey };
        }
        
        // Safely extract the metric value using view or table aliases, falling back to 0
        const rawValue = row.rmse !== undefined ? row.rmse : (row as any).metric_value;
        
        // Bind the specific model's score to this date context
        if (row.model_line_id) {
          timelineMap[dateKey][row.model_line_id] = rawValue != null ? Number(Number(rawValue).toFixed(4)) : 0;
        }
      });

      // 3. Sort chronologically so chart lines display smoothly from left to right
      const sortedTimeline = Object.values(timelineMap).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setChartData(sortedTimeline);
    } catch (err) {
      console.error("Error pulling periodic simulation metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Setup Lifecycle Interval for Periodic Reloading
  useEffect(() => {
    setMounted(true);

    // Initial load when user lands on page
    fetchMetricsFromBackend();

    // Set up polling interval (e.g., fetch every 10 seconds)
    const POLLING_INTERVAL_MS = 10000; 
    const intervalId = setInterval(() => {
      fetchMetricsFromBackend();
    }, POLLING_INTERVAL_MS);

    // CRITICAL CLEANUP: Clears memory if user navigates away from page
    return () => clearInterval(intervalId);
  }, []);

  if (!mounted) return null;

  return (
    <div className="main-content">
      {/* KPI Section */}
      <div className="kpi-grid">
        <KPICard 
          icon={TrendingDown} 
          value={chartData.length > 0 ? `${chartData[chartData.length - 1][modelLines[0] || ""] || "N/A"} min` : "Loading..."} 
          label="Latest Evaluated RMSE" 
          meta="Auto-refreshing live stream" 
          colorClass="indigo" 
        />
        <KPICard 
          icon={Clock} 
          value="Live Polling" 
          label="Refresh Status" 
          meta="Syncing every 10s" 
          colorClass="green" 
        />
        <KPICard 
          icon={Database} 
          value={`${chartData.length} days`} 
          label="Simulated Context Length" 
          meta="Chronological data range" 
          colorClass="amber" 
        />
        <KPICard 
          icon={Layers} 
          value={modelLines.length.toString()} 
          label="Tracked Version Branches" 
          meta="Active registry models" 
          colorClass="purple" 
        />
      </div>

      {/* Main Timeplot Chart */}
      {loading ? (
        <div className="card h-64 flex items-center justify-center text-zinc-400">Connecting to live stream...</div>
      ) : (
        <PerformanceChart data={chartData} lines={modelLines} />
      )}

      {/* Secondary Data */}
      {/* <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Drift Monitor</h2>
          <div className="chart-container-small" style={{ height: '250px' }}>

          </div>
        </div>

        <IngestionTable history={ingestionHistory} />
      </div> */}
    </div>
  );
}