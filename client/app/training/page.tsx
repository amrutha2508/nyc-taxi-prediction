"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Play } from "lucide-react";
import { TrainingConfig } from "@/components/Training/TrainingConfig";
import { JobHistoryTable } from "@/components/Training/JobHistoryTable";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast"

export default function TrainingPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Assuming GET /training returns your RunID, datasets, status, etc.
      const data = await apiClient.get("/api/training/jobs");
      setHistory(data);
    } catch (err) { console.error("Failed to fetch history", err); }
  };

  const handleStartTraining = async (config: any) => {
    setIsTraining(true);
    try {
      await apiClient.post("/api/training/train", config);
      toast.success("Training job submitted");
      // Wait 5 seconds (5000ms) before updating the UI
      setTimeout(() => {
        fetchHistory();
        setIsTraining(false);
      }, 10000);

    } catch (err) {
      toast.error("Failed to start training.");
      // If the request itself fails, unlock the button immediately
      setIsTraining(false); 
    }
    // Removed the 'finally' block so it doesn't flip back to false immediately
  };

  if (!mounted) return null;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Model Training</h1>
        <p className="page-subtitle">Configure parameters and select training sets</p>
      </div>

      {/* Two Section Layout: Models on Left, Datasets on Right */}
      <TrainingConfig onStart={handleStartTraining} isTraining={isTraining} />

      {isTraining && (
        <div className="loading-banner mt-6 animate-pulse border border-indigo-500/30 bg-indigo-500/5 p-6 rounded-xl flex items-center gap-4">
          <Loader2 className="spinner text-indigo-400" />
          <div>
            <div className="font-bold">Training Engine Active</div>
            <div className="text-sm text-slate-400">Monitoring MLflow Run...</div>
          </div>
        </div>
      )}

      {/* History Section at the Bottom */}
      <JobHistoryTable history={history} />
    </div>
  );
}