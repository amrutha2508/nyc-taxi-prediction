"use client";
import { X, Copy, ChevronRight , Brain} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  running:   "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse",
  failed:    "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  pending:   "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

export const ModelSidePanel = ({ model, artifact_uri, onClose, featureData }: any) => {
  const [data, setData] = useState({});
  console.log("inside modelsidepanel, model:",model);

// 1. Move the function inside useEffect or wrap in useCallback 
  // so it safely handles the changes.
  useEffect(() => {
    const fetchModelDetails = async () => {
      // Guard clause: Don't run the API call if model or job_id is missing
      if (!model?.job_id) return; 

      try {
        const response = await apiClient.get(`/api/models/jobdetails/${model.job_id}`);
        setData(response);
        console.log("model data:", response);
      } catch (err) { 
        console.error("Failed to fetch model details", err); 
      }
    };

    fetchModelDetails();
  }, [model?.job_id]); // 2. Add the specific job_id to the dependency array

  // 3. Keep your UI guard clause at the bottom, beneath all hooks
  if (!model) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-gray-400" />
            <span className="font-medium text-sm">Training job details</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">

          {/* kpi row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Val RMSE",   value: data.val_rmse?.toFixed(2) ?? "—" },
              { label: "Duration",   value: data.duration ?? "—" },
              { label: "Model type", value: data.model_type },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* run info */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-medium">Run info</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: "Job ID",        value: data.job_id, mono: true },
                  { label: "MLflow run ID", value: data.run_id, mono: true, copy: true },
                  { label: "Created at",    value: new Date(data.created_at).toUTCString() },
                  { label: "Artifact URI",  value: artifact_uri, mono: true },
                ].map(({ label, value, mono, copy }) => (
                  <tr key={label} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="px-4 py-2.5 text-gray-500 w-36">{label}</td>
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
                      {copy && (
                        <button onClick={() => navigator.clipboard.writeText(value)} className="text-gray-400 hover:text-gray-600">
                          <Copy size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* params + datasets */}
          <div className="grid grid-cols-2 gap-3">

            {/* <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-medium">Hyperparameters</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(params).map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <td className="px-4 py-2 text-gray-500">{k}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}

            <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-medium">Datasets</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  {/* <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Train</p> */}
                  <div className="flex flex-wrap gap-1.5">
                    {data.train_dataset_ids?.map((id: string) => (
                      <span key={id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{id}</span>
                    ))}
                  </div>
                </div>
                {/* <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Validation</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.val_dataset_ids?.map((id: string) => (
                      <span key={id} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{id}</span>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>

          </div>

          {/* actions */}
          {/* <div className="flex gap-2 pt-1">
            <button className="btn btn-primary flex-1 text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={handleModelRegister}>
              Add to model Registry
            </button>
          </div> */}

        </div>
      </div>
    </div>
  )
};