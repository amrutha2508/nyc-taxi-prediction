import { X, Brain, Copy } from "lucide-react"
import { useState } from "react";
import { apiClient } from "@/lib/api";
const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  running:   "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse",
  failed:    "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  pending:   "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

export default function JobDetails({ data, onClose }: { data: any; onClose: () => void }) {
  const params = data.parameters ?? {}
  const [isModelRegister, setIsModelRegister] = useState(false);
  const handleModelRegister = async () => {
    setIsModelRegister(true);
    try {
      await apiClient.post("/api/training/register", data);
      alert("Model added to Model registery");
    } catch (err) {
      alert("Failed to register model.");
    } finally {
      setIsModelRegister(false);
    }
  };

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
            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusStyles[data.status] ?? statusStyles.pending}`}>
              {data.status}
            </span>
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
                  { label: "Artifact URI",  value: data.artifact_uri, mono: true },
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

            <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
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
            </div>

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
          <div className="flex gap-2 pt-1">
            <button className="btn btn-primary flex-1 text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={handleModelRegister}>
              Add to model Registry
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}