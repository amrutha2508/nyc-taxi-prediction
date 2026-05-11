import { ArrowRight, AlertTriangle } from "lucide-react";

export const DeployModal = ({ runId, onClose }: { runId: string, onClose: () => void }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        <h2 className="modal-title mb-4">Deploy to Production</h2>
        <div className="alert alert-warning mb-6">
          <p className="text-sm">
            Deploying <span className="font-mono font-bold">{runId}</span> will replace the current production model.
          </p>
        </div>

        <div className="comparison-container mb-6">
          <div className="comparison-item">
            <div className="comparison-label">Current</div>
            <div className="comparison-value">3.24</div>
          </div>
          <ArrowRight className="opacity-30" />
          <div className="comparison-item">
            <div className="comparison-label">New</div>
            <div className="comparison-value success">3.28</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-success flex-1">Confirm Deploy</button>
        </div>
      </div>
    </div>
  </div>
);