"use client";
import React, { useState, useEffect } from "react";
import { DatasetCard } from "@/components/Datasets/DatasetCard";
import { DatasetModal } from "@/components/Datasets/DatasetModal";

// Mock Data
const datasets = [
  { month: "June 2024", rows: 2841253, avgDistance: 3.8, avgDuration: 16.8, ingested: true, outliers: 2.3 },
  { month: "May 2024", rows: 2756892, avgDistance: 3.6, avgDuration: 16.3, ingested: true, outliers: 2.1 },
  { month: "April 2024", rows: 2691445, avgDistance: 3.5, avgDuration: 16.1, ingested: true, outliers: 2.0 },
  // ... rest of your dataset array
];

const hourDistribution = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  count: Math.floor(Math.random() * 150000) + 50000
}));

const boroughData = [
  { borough: "Manhattan", count: 1234567 },
  { borough: "Brooklyn", count: 876543 },
  { borough: "Queens", count: 654321 },
];

const vendorData = [
  { name: "CMT", value: 45 },
  { name: "VTS", value: 35 },
  { name: "Other", value: 20 },
];

export default function DatasetsPage() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Datasets</h1>
        <p className="page-subtitle">NYC Taxi Monthly Records</p>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">From</label>
          <select className="filter-select"><option>Jan 2024</option></select>
        </div>
        <div className="filter-group">
          <label className="filter-label">To</label>
          <select className="filter-select"><option>Jun 2024</option></select>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          Load Dataset
        </button>
      </div>

      <div className="grid-3">
        {datasets.map((dataset, idx) => (
          <DatasetCard 
            key={idx} 
            dataset={dataset} 
            onOpenDetails={() => setSelectedDataset(dataset.month)} 
          />
        ))}
      </div>

      {selectedDataset && (
        <DatasetModal 
          month={selectedDataset} 
          onClose={() => setSelectedDataset(null)}
          hourData={hourDistribution}
          boroughData={boroughData}
          vendorData={vendorData}
        />
      )}
    </div>
  );
}