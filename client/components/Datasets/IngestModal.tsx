"use client";
import React, { useState } from "react";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (year: number, month: number) => void;
  loading: boolean;
}

export const IngestModal = ({ isOpen, onClose, onConfirm, loading }: IngestModalProps) => {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(6);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Ingest New Dataset</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        
        <div className="modal-body">
          <p className="text-sm mb-4">Select the period to fetch from NYC Green Taxi records.</p>
          
          <div className="form-group mb-4">
            <label className="filter-label">Year</label>
            <select 
              className="filter-select w-full" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {[2024, 2023, 2022, 2021].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="filter-label">Month</label>
            <select 
              className="filter-select w-full" 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onConfirm(year, month)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm & Load"}
          </button>
        </div>
      </div>
    </div>
  );
};