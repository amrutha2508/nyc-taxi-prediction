"use client";
import { X, Copy, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const ModelSidePanel = ({ model, onClose, featureData }: any) => {
  if (!model) return null;

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="side-panel-title">
              {model.runId} <Copy size={14} className="inline ml-1 cursor-pointer opacity-50 hover:opacity-100" />
            </div>
            <span className={`badge badge-${model.stage.toLowerCase()}`}>{model.stage}</span>
          </div>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>
      </div>

      <div className="side-panel-body">
        <div className="section">
          <h3 className="section-title">Metrics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Train RMSE</div>
              <div className="stat-value">{model.trainRmse.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Val RMSE</div>
              <div className="stat-value">{model.valRmse.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Feature Importance</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #475569' }} />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Hyperparameters</h3>
          <div className="code-block">
            <div className="code-line"><span className="code-key">learning_rate:</span> 0.1</div>
            <div className="code-line"><span className="code-key">max_depth:</span> 6</div>
            <div className="code-line"><span className="code-key">n_estimators:</span> 100</div>
          </div>
        </div>
      </div>
    </div>
  );
};