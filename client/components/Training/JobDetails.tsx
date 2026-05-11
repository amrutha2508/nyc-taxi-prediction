"use client";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const JobDetails = ({ scatterData, featureData }: any) => (
  <tr>
    <td colSpan={9} className="bg-slate-900/50 p-6">
      <div className="grid-2 gap-6">
        <div className="section">
          <h3 className="section-title">Predicted vs Actual</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="actual" stroke="#94a3b8" tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="predicted" stroke="#94a3b8" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #475569' }} />
                <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Feature Importance</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={100} />
                <Bar dataKey="importance" fill="#10b981" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <button className="btn btn-primary btn-full mt-4">Register to Model Registry</button>
    </td>
  </tr>
);