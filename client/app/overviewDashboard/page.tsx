"use client";
import React, { useState, useEffect } from "react";
import { TrendingDown, Clock, Database, Layers } from "lucide-react";

// Components
import { KPICard } from "@/components/Overview/KPICard";
import { PerformanceChart } from "@/components/Overview/PerformanceChart";
import { IngestionTable } from "@/components/Overview/IngestionTable";

// Mock Data
const performanceData = [
  { month: "Jan 2024", production: 3.42, staging: 3.38 },
  { month: "Feb 2024", production: 3.38, staging: 3.35 },
  { month: "Mar 2024", production: 3.35, staging: 3.28 },
  { month: "Apr 2024", production: 3.32, staging: 3.24 },
  { month: "May 2024", production: 3.28, staging: 3.22 },
  { month: "Jun 2024", production: 3.24, staging: 3.18 },
];

const ingestionHistory = [
  { date: "2024-06-10", dataset: "Jun 2024", status: "Success" },
  { date: "2024-05-10", dataset: "May 2024", status: "Success" },
  { date: "2024-04-10", dataset: "Apr 2024", status: "Success" },
  { date: "2024-01-10", dataset: "Jan 2024", status: "Failed" },
];

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="main-content">
      {/* KPI Section */}
      <div className="kpi-grid">
        <KPICard 
          icon={TrendingDown} 
          value="3.24 min" 
          label="Current RMSE" 
          meta="Production Model" 
          colorClass="indigo" 
        />
        <KPICard 
          icon={Clock} 
          value="2 hours ago" 
          label="Last Ingestion" 
          meta="Status: Success" 
          colorClass="green" 
        />
        <KPICard 
          icon={Database} 
          value="6 months" 
          label="Datasets Loaded" 
          meta="Jan 2024 – Jun 2024" 
          colorClass="amber" 
        />
        <KPICard 
          icon={Layers} 
          value="12" 
          label="Models Trained" 
          meta="2 Staging, 1 Prod" 
          colorClass="purple" 
        />
      </div>

      {/* Main Charts */}
      <PerformanceChart data={performanceData} />

      {/* Secondary Data */}
      <div className="grid-2">
        {/* You could also extract this Drift chart similarly */}
        <div className="card">
          <h2 className="card-title">Drift Monitor</h2>
          <div className="chart-container-small" style={{ height: '250px' }}>
             {/* Simple placeholder or another Chart component */}
          </div>
        </div>

        <IngestionTable history={ingestionHistory} />
      </div>
    </div>
  );
}