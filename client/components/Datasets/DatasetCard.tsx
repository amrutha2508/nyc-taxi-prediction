import { Check, X } from "lucide-react";

interface Dataset {
  month: string;
  rows: number;
  avgDistance: number;
  avgDuration: number;
  ingested: boolean;
  outliers: number;
}

export const DatasetCard = ({ dataset, onOpenDetails }: { dataset: Dataset, onOpenDetails: () => void }) => (
  <div className="dataset-card">
    <div className="dataset-card-header">
      <h3 className="dataset-card-title">{dataset.month}</h3>
      {dataset.ingested ? (
        <div className="dataset-status ingested">
          <Check size={14} /> Ingested
        </div>
      ) : (
        <div className="dataset-status not-ingested">
          <X size={14} /> Not Ingested
        </div>
      )}
    </div>

    <div className="dataset-metrics">
      <div className="dataset-row-count">
        {dataset.rows.toLocaleString()} <span>rows</span>
      </div>

      <div className="badge-group">
        <span className="badge badge-teal">{dataset.avgDistance} mi avg</span>
        <span className="badge badge-purple">{dataset.avgDuration} min avg</span>
      </div>

      {dataset.ingested && (
        <div className="progress-bar-container">
          <div className="progress-bar-header">
            <span>Outliers Removed</span>
            <span>{dataset.outliers}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${dataset.outliers * 10}%` }} />
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