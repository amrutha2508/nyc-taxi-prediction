"use client";
import { X, Table as TableIcon, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

export const DatasetModal = ({ 
  month_year, 
  onClose, 
  metadata // This is the dict input you provided
}: any) => {

  const numStats = metadata?.numerical_stats || {};
  const catStats = metadata?.categorical_stats || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{month_year} - Details</h2>
            <p className="modal-subtitle">Feature summary and statistics</p>
          </div>
          <button onClick={onClose} className="modal-close"><X size={24} /></button>
        </div>

        <div className="modal-body">

          {/* Descriptive Statistics Table Section */}
          <div className="section mt-6">
            <h3 className="section-title"><TableIcon size={16} className="inline mr-2" /> Numerical Metadata</h3>
            <div className="overflow-x-auto border border-slate-700 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2 border-b border-slate-700">Feature</th>
                    <th className="p-2 border-b border-slate-700">Mean</th>
                    <th className="p-2 border-b border-slate-700">Std</th>
                    <th className="p-2 border-b border-slate-700">Min</th>
                    <th className="p-2 border-b border-slate-700">50% (Med)</th>
                    <th className="p-2 border-b border-slate-700">Max</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {Object.keys(numStats).map((key) => (
                    <tr key={key} className="hover:bg-slate-800/50">
                      <td className="p-2 border-b border-slate-800 font-medium text-indigo-400">{key}</td>
                      <td className="p-2 border-b border-slate-800">
                        {typeof numStats[key].mean === 'number' ? numStats[key].mean.toFixed(2) : 'N/A'}
                      </td>
                      <td className="p-2 border-b border-slate-800">
                        {typeof numStats[key].std === 'number' ? numStats[key].std.toFixed(2) : '0'}
                      </td>
                      <td className="p-2 border-b border-slate-800">{numStats[key].min}</td>
                      <td className="p-2 border-b border-slate-800">{numStats[key]['50%']}</td>
                      <td className="p-2 border-b border-slate-800">{numStats[key].max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2 mt-6">
            {/* Categorical Stats */}
            <div className="section mt-6">
              <h3 className="section-title"><TableIcon size={16} className="inline mr-2" /> Categorical Metadata</h3>
              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-slate-700">Feature</th>
                      <th className="p-2 border-b border-slate-700">Top Value</th>
                      <th className="p-2 border-b border-slate-700">Frequency</th>
                      <th className="p-2 border-b border-slate-700">Unique</th>
                      <th className="p-2 border-b border-slate-700">Count</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {Object.keys(catStats).map((key) => (
                      <tr key={key} className="hover:bg-slate-800/50">
                        <td className="p-2 border-b border-slate-800 font-medium text-emerald-400">{key}</td>
                        <td className="p-2 border-b border-slate-800 font-bold text-slate-100">
                          {catStats[key].top ?? 'N/A'}
                        </td>
                        <td className="p-2 border-b border-slate-800">
                          {typeof catStats[key].freq === 'number' ? catStats[key].freq.toLocaleString() : catStats[key].freq}
                        </td>
                        <td className="p-2 border-b border-slate-800">{catStats[key].unique}</td>
                        <td className="p-2 border-b border-slate-800">{catStats[key].count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};