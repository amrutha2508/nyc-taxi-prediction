"use client";
import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { ModelSidePanel } from "@/components/Models/ModelSidePanel";
import { DeployModal } from "@/components/Models/DeployModal";

const models = [
  { runId: "a3f9c2d1", dataset: "Jun 2024", trainRmse: 3.18, valRmse: 3.24, liveRmse: 3.24, stage: "Production", registeredAt: "2024-06-10 14:32" },
  { runId: "q7r8s9t0", dataset: "May 2024", trainRmse: 3.20, valRmse: 3.28, liveRmse: 3.30, stage: "Staging", registeredAt: "2024-05-10 09:15" },
  { runId: "m3n4o5p6", dataset: "Apr 2024", trainRmse: 3.22, valRmse: 3.32, liveRmse: 3.35, stage: "Staging", registeredAt: "2024-04-10 11:48" },
  { runId: "i9j0k1l2", dataset: "Mar 2024", trainRmse: 3.25, valRmse: 3.35, liveRmse: null, stage: "Candidate", registeredAt: "2024-03-10 16:21" },
];

const featureImportance = [
  { feature: "trip_distance", importance: 0.28 },
  { feature: "pickup_hour", importance: 0.18 },
  { feature: "day_of_week", importance: 0.14 },
];

export default function ModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const filteredModels = models.filter(m => m.runId.includes(searchTerm.toLowerCase()));
  const selectedModel = models.find(m => m.runId === selectedModelId);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Models</h1>
        <p className="page-subtitle">Experiment Tracker & Registry</p>
      </div>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search RUN_ID..." 
          className="filter-input" 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>RUN_ID</th>
                <th>Dataset</th>
                <th>Val RMSE</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr key={model.runId} onClick={() => setSelectedModelId(model.runId)} className="cursor-pointer">
                  <td className="text-mono font-bold">{model.runId}</td>
                  <td><span className="badge-dataset">{model.dataset}</span></td>
                  <td>{model.valRmse.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${model.stage.toLowerCase()}`}>{model.stage}</span>
                  </td>
                  <td>
                    {model.stage === "Staging" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeployingId(model.runId); }}
                        className="btn btn-success py-1 px-3"
                      >
                        Deploy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModelSidePanel 
        model={selectedModel} 
        onClose={() => setSelectedModelId(null)} 
        featureData={featureImportance}
      />

      {deployingId && (
        <DeployModal runId={deployingId} onClose={() => setDeployingId(null)} />
      )}
    </div>
  );
}