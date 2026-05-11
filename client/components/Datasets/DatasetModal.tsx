"use client";
import { X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

export const DatasetModal = ({ month, onClose, hourData, boroughData, vendorData }: any) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{month} - Details</h2>
            <p className="modal-subtitle">Feature summary and statistics</p>
          </div>
          <button onClick={onClose} className="modal-close"><X size={24} /></button>
        </div>

        <div className="modal-body">
          {/* Charts Row */}
          <div className="section">
            <h3 className="section-title">Pickup Hour Distribution</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1D27', border: '1px solid #475569' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            <div className="section">
              <h3 className="section-title">Borough Distribution</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boroughData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="borough" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={80} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Vendor Share</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vendorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {vendorData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};