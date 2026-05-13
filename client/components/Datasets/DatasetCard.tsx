import { Check, X } from "lucide-react";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

interface Dataset {
  month_year: string;
  row_count: number;
  avg_distance: number;
  avg_duration: number;
  ingested: boolean;
  outlier_percentage: number;
  added_at: Timestamp
}

export const DatasetCard = ({ dataset, onOpenDetails }: { dataset: Dataset, onOpenDetails: () => void }) => (
  <div className="dataset-card">
    <div className="dataset-card-header">
      <h3 className="dataset-card-title">{dataset.month_year}</h3>
      {dataset.added_at ? (
        <div className="dataset-status ingested">
          <Check size={14} /> Added
        </div>
      ) : (
        <div className="dataset-status not-ingested">
          <X size={14} /> Not Added
        </div>
      )}
    </div>

    <div className="dataset-metrics">
      <div className="dataset-row-count">
        {dataset.row_count.toLocaleString()} <span>rows</span>
      </div>

      <div className="badge-group">
        <span className="badge badge-teal">{dataset.avg_distance} mi avg</span>
        <span className="badge badge-purple">{dataset.avg_duration} min avg</span>
      </div>

      {dataset.ingested && (
        <div className="progress-bar-container">
          <div className="progress-bar-header">
            <span>Outliers Removed</span>
            <span>{dataset.outlier_percentage}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${dataset.outlier_percentage * 10}%` }} />
          </div>
        </div>
      )}
    </div>

    <div className="dataset-actions">
      <button onClick={onOpenDetails} className="btn btn-secondary">View Details</button>
      <button className="btn btn-primary">Use for Training</button>
    </div>
  </div>
);