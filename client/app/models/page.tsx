"use client";
import React, { useState, useEffect } from "react";
import { ModelSidePanel } from "@/components/Models/ModelSidePanel";
import { DeployModal } from "@/components/Models/DeployModal";
import { StageModal } from "@/components/Models/StageModal";
import { apiClient } from "@/lib/api";
import { ReStageModal } from "@/components/Models/reStageModal";
import { ArchiveModal } from "@/components/Models/ArchiveModal";

// Define an interface matching your DB records and API payloads
interface ModelRecord {
  id: string;
  run_id: string;
  model_name: string;
  version: string | number;
  status: "candidate" | "staging" | "production" | "archived";
  artifact_uri?: string;
  metrics: {
    val_rmse: number;
    [key: string]: any;
  };
}

const featureImportance = [
  { feature: "trip_distance", importance: 0.28 },
  { feature: "pickup_hour", importance: 0.18 },
  { feature: "day_of_week", importance: 0.14 },
];

export default function ModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  // Tracks exactly which action modal is active for a given run_id
  const [activeModal, setActiveModal] = useState<{ model_id: string; type: "deploy" | "stage" } | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [models, setModels] = useState<ModelRecord[]>([]);

  const fetchModels = async () => {
    try {
      const data = await apiClient.get("/api/models");
      setModels(data);
    } catch (err) { 
      console.error("Failed to fetch models:", err); 
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchModels();
  }, []);

  if (!mounted) return null;

  // Safe checks for filtering against missing/nullish fields
  const filteredModels = models.filter(m => 
    m.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedModel = models.find(m => m.run_id === selectedModelId);
  const artifact_uri = selectedModel?.artifact_uri;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Models</h1>
        <p className="page-subtitle">Experiment Tracker & Registry</p>
      </div>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search model type..." 
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
                <th>model_name</th>
                <th>version</th>
                <th>Val RMSE</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr 
                  key={model.id || model.run_id} 
                  onClick={() => setSelectedModelId(model.run_id)} 
                  className="cursor-pointer"
                >
                  <td className="text-mono font-bold">{model.run_id}</td>
                  <td>{model.model_name}</td>
                  <td><span className="badge-dataset">{model.version}</span></td>
                  <td>{model.metrics?.val_rmse?.toFixed(2) ?? "N/A"}</td>
                  <td>
                    {/* Database statuses match CSS class variants directly */}
                    <span className={`badge badge-${model.status} text-capitalize`}>
                      {model.status}
                    </span>
                  </td>
                  <td>
                    {/* Aligned strict conditions directly with database string variations */}
                    {model.status === "staging" && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveModal({ model_id: model.id, type: "deploy" }); 
                        }}
                        className="btn border-4 border-green-400 bg-green-400/30 text-green-400 hover:bg-green-400/50 transition-colors"
                      >
                        Deploy
                      </button>
                    )}
                    {model.status === "candidate" && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveModal({ model_id: model.id, type: "stage" }); 
                        }}
                        className="btn border-4 border-amber-400 bg-amber-400/30 text-amber-400 hover:bg-amber-400/50 transition-colors"
                      >
                        Stage
                      </button>
                    )}
                    {model.status === "production" && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveModal({ model_id: model.id, type: "archive" }); 
                        }}
                        className="btn border-4 border-purple-400 bg-purple-400/30 text-purple-400 hover:bg-purple-400/50 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    {model.status === "archived" && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveModal({ model_id: model.id, type: "reStage" }); 
                        }}
                        className="btn border-4 border-amber-400 bg-amber-400/30 text-amber-400 hover:bg-amber-400/50 transition-colors"
                      >
                        re-Stage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      { 
        selectedModel && (
          <ModelSidePanel 
            model={selectedModel} 
            artifact_uri={artifact_uri}
            onClose={() => setSelectedModelId(null)} 
            featureData={featureImportance}
          />
        )
      }

      {/* Explicitly renders the exact modal requested by the click handle state */}
      {activeModal?.type === "deploy" && (
        <DeployModal modelId={activeModal.model_id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === "stage" && (
        <StageModal modelId={activeModal.model_id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === "archive" && (
        <ArchiveModal modelId={activeModal.model_id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.type === "reStage" && (
        <ReStageModal modelId={activeModal.model_id} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}