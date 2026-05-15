"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

const DEFAULT_PARAMS = {
  random_forest: { n_estimators: 100, max_depth: 10, min_samples_split: 2 },
  xgboost: { learning_rate: 0.1, n_estimators: 200, max_depth: 6, subsample: 0.8 },
  linear_regression: {  }
};

export const TrainingConfig = ({ onStart, isTraining }: any) => {
  const [modelType, setModelType] = useState("xgboost");
  const [params, setParams] = useState(JSON.stringify(DEFAULT_PARAMS.xgboost, null, 2));
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load datasets from your public.datasets table
    apiClient.get("/api/datasets").then(setAvailableDatasets);
  }, []);

  const handleModelChange = (type: string) => {
    setModelType(type);
    setParams(JSON.stringify(DEFAULT_PARAMS[type as keyof typeof DEFAULT_PARAMS], null, 2));
  };

  const toggleDataset = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid-2 gap-6">
      {/* LEFT: Models */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Model Configuration</h3>
        <div className="form-group mb-4">
          <label className="filter-label">Model Type</label>
          <select 
            className="filter-select w-full" 
            value={modelType}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="xgboost">XGBoost Regressor</option>
            <option value="random_forest">Random Forest</option>
            <option value="linear_regression">Linear Regression</option>
          </select>
        </div>
        <div className="form-group">
          <label className="filter-label">Parameters (JSON)</label>
          <textarea
            className="filter-select w-full h-48 font-mono text-sm"
            value={params}
            onChange={(e) => setParams(e.target.value)}
          />
        </div>
      </div>

      {/* RIGHT: Datasets */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Dataset Selection</h3>
        <div className="overflow-y-auto h-72 border border-slate-800 rounded-lg p-2">
          {availableDatasets.map((ds) => (
            <div 
              key={ds.id} 
              className={`flex items-center justify-between p-3 mb-2 rounded-md border ${
                selectedIds.includes(ds.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="font-medium">{ds.month_year}</div>
                <div className="text-xs text-slate-500">{ds.row_count.toLocaleString()} rows</div>
              </div>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(ds.id)}
                onChange={() => toggleDataset(ds.id)}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
          ))}
        </div>
        
        <button 
          className="btn btn-primary w-full mt-6"
          disabled={isTraining || selectedIds.length === 0}
          onClick={() => onStart({ modelType, params: JSON.parse(params), datasets: selectedIds })}
        >
          {isTraining ? "Training..." : "Launch Training Job"}
        </button>
      </div>
    </div>
  );
};