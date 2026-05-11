"use client";
import React from "react";
import { Loader2 } from "lucide-react";

export const TrainingForm = ({ isTraining, onStart }: { isTraining: boolean, onStart: () => void }) => {
  return (
    <div className="card">
      <h2 className="card-title mb-4">Start New Training Job</h2>
      
      <div className="form-group">
        <label className="form-label">Dataset</label>
        <select className="form-input">
          <option>Jun 2024 (Recommended)</option>
          <option>May 2024</option>
        </select>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">n_estimators</label>
          <input type="number" defaultValue={100} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">learning_rate</label>
          <input type="number" step="0.01" defaultValue={0.1} className="form-input" />
        </div>
      </div>

      <button 
        onClick={onStart} 
        disabled={isTraining} 
        className="btn btn-primary btn-full py-3"
      >
        {isTraining ? (
          <><Loader2 className="spinner mr-2" size={18} /> Training in Progress...</>
        ) : (
          "Start Training"
        )}
      </button>
    </div>
  );
};