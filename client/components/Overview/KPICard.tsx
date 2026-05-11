// components/Overview/KPICard.tsx
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  meta: string;
  colorClass: string; // e.g., "indigo", "green"
  statusClass?: string; // e.g., "success"
}

export const KPICard = ({ icon: Icon, value, label, meta, colorClass, statusClass }: KPICardProps) => (
  <div className="kpi-card">
    <div className={`kpi-icon ${colorClass}`}>
      <Icon size={20} className={`icon-${colorClass}`} />
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
    <div className={`kpi-meta ${statusClass || ""}`}>{meta}</div>
  </div>
);