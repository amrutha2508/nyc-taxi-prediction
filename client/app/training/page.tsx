"use client";
import React, { useState, useEffect } from "react";
import { Copy, Loader2 } from "lucide-react";
import { TrainingForm } from "@/components/Training/TrainingForm";
import { JobDetails } from "@/components/Training/JobDetails";

const trainingHistory = [
  { jobId: "job_245", dataset: "Jun 2024", status: "Completed", valRmse: 3.24, duration: "4m 32s", triggeredAt: "2024-06-10 14:25", runId: "a3f9c2d1" },
  { jobId: "job_242", dataset: "Mar 2024", status: "Failed", valRmse: null, duration: "0m 45s", triggeredAt: "2024-03-10 16:15", runId: null },
];

const scatterData = Array.from({ length: 50 }, () => ({
  actual: Math.random() * 30 + 10,
  predicted: Math.random() * 30 + 10,
}));

const featureImportance = [
  { feature: "trip_distance", importance: 0.28 },
  { feature: "pickup_hour", importance: 0.18 },
];

export default function TrainingPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const startTraining = () => {
    setIsTraining(true);
    setTimeout(() => setIsTraining(false), 4000);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Training Jobs</h1>
        <p className="page-subtitle">Train & Evaluate Models</p>
      </div>

      <div className="grid-2 gap-6 items-start">
        <TrainingForm isTraining={isTraining} onStart={startTraining} />
        
        {isTraining && (
          <div className="loading-banner animate-pulse border border-indigo-500/30 bg-indigo-500/5 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="spinner text-indigo-400" />
              <span className="font-bold">Execution Engine Active</span>
            </div>
            <div className="text-sm text-slate-400 mb-2">Step: Hyperparameter Optimization...</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-2/3 transition-all duration-1000" />
            </div>
          </div>
        )}
      </div>

      <div className="card p-0 mt-8">
        <div className="p-4 border-b border-slate-800">
          <h2 className="card-title">Job History</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Status</th>
                <th>Val RMSE</th>
                <th>Duration</th>
                <th>Run ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainingHistory.map((job) => (
                <React.Fragment key={job.jobId}>
                  <tr>
                    <td className="text-mono">{job.jobId}</td>
                    <td>
                      <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                    </td>
                    <td>{job.valRmse?.toFixed(2) || "—"}</td>
                    <td>{job.duration}</td>
                    <td className="text-mono opacity-60">{job.runId || "—"}</td>
                    <td>
                      <button 
                        onClick={() => setExpandedJob(expandedJob === job.jobId ? null : job.jobId)}
                        className="text-link"
                      >
                        {expandedJob === job.jobId ? "Close" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                  {expandedJob === job.jobId && job.status === "Completed" && (
                    <JobDetails scatterData={scatterData} featureData={featureImportance} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}