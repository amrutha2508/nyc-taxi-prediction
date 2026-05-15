"use client";
import React, { useState } from "react";
import JobDetails from "./JobDetails";

export const JobHistoryTable = ({ history }: { history: any[] }) => {
  const [selectedJob, setSelectedJob] = useState<any>({})
  const [jobDetailModal, setJobDetailModal] = useState(false)

  return (
    <div className="card p-0 mt-8">
      <div className="p-4 border-b border-slate-800">
        <h2 className="card-title">Training Details</h2>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Model Type</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Val RMSE</th>
              <th>Artifact</th>
            </tr>
          </thead>
          <tbody>
            {history.map((job) => (
              <tr key={job.run_id}>
                <td className="text-mono text-indigo-400">{job.run_id.slice(0,8)}</td>
                <td>
                  {job.model_type}
                   {/* <div className="flex flex-wrap gap-1">
                      {job.train_datasets?.map((d: string) => (
                        <span key={d} className="badge badge-secondary text-[10px]">{d}</span>
                      ))}
                   </div> */}
                </td>
                <td>
                  <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                </td>
                <td>{job.duration}</td>
                <td className="font-bold">{job.val_rmse ? job.val_rmse.toFixed(4) : "N/A"}</td>
                <td>
                  <button className="btn btn-primary" title="View in MLflow" onClick={() => {setSelectedJob(job); setJobDetailModal(true)}}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {selectedJob && jobDetailModal && (
          <JobDetails 
            data = {selectedJob}
            onClose={() => {setSelectedJob(null); setJobDetailModal(false)}}
          />
        )}
    </div>
  );
};