"use client";
import React, { useState, useEffect } from "react";
import { DatasetCard } from "@/components/Datasets/DatasetCard";
import { DatasetModal } from "@/components/Datasets/DatasetModal";
import { apiClient } from "@/lib/api";
import { IngestModal } from "@/components/Datasets/IngestModal";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>({});
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Function to fetch data from Supabase via your API
  const loadStoredDatasets = async () => {
    try {
      const data = await apiClient.get("/api/datasets"); // Assumes GET /datasets returns all rows
      setDatasets(data);
    } catch (error) {
      console.error("Error fetching datasets:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadStoredDatasets(); // Initial load
  }, []);
  const handleIngestConfirm = async (year: number, month: number) => {
    setLoading(true);
    try {
      await apiClient.post("/api/datasets", { year, month });
      setIsIngestModalOpen(false);
      alert("Ingestion started in background.");
      
      // Optional: Wait a moment for the row to be created then refresh
      setTimeout(loadStoredDatasets, 1000);
    } catch (error) {
      alert("Failed to start ingestion.");
    } finally {
      setLoading(false);
    }
  };


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
        <button 
          className="btn btn-primary" 
          style={{ marginLeft: 'auto' }}
          onClick={() => setIsIngestModalOpen(true)}
        >
          Add New Dataset
        </button>
      </div>

      <div className="grid-3">
        {datasets.map((dataset, idx) => (
          <DatasetCard 
            key={idx} 
            dataset={dataset} 
            onOpenDetails={() => {setSelectedDataset(dataset); setIsDetailModalOpen(true)}} 
          />
        ))}
      </div>

      {selectedDataset && isDetailModalOpen && (
        <DatasetModal 
          month_year={selectedDataset.month_year} 
          onClose={() => setSelectedDataset(null)}
          metadata = {selectedDataset.metadata}
        />
      )}

      {/* New Ingestion Input Modal */}
      <IngestModal 
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onConfirm={handleIngestConfirm}
        loading={loading}
      />
    </div>
  );
}