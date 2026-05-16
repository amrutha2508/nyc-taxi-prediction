import { apiClient } from "@/lib/api";
import { ArrowRight, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ArchiveModalProps {
  modelId: string;
  runId: string; // Added runId since it's used in the text
  onClose: () => void;
}
export const ArchiveModal = ({ modelId, onClose }: ArchiveModalProps) => {
  const handleArchiveModel = async () => {
    try {
      // Fixed the template literal syntax bug here
      const data = await apiClient.post(`/api/models/archive/${modelId}`);
      toast.success("Successfully Archived the model");
      console.log("model Archive result:", data);
      onClose(); // Close the modal after success
    } catch (error) {
      toast.error("Failed to Archive the model");
    }
  };
  return(
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        <h2 className="modal-title mb-4">Archive the Model</h2>
        {/* <div className="alert alert-warning mb-6">
          <p className="text-sm">
            Deploying <span className="font-mono font-bold">{modelId}</span> will replace the current production model.
          </p>
        </div> */}

        {/* <div className="comparison-container mb-6">
          <div className="comparison-item">
            <div className="comparison-label">Current</div>
            <div className="comparison-value">3.24</div>
          </div>
          <ArrowRight className="opacity-30" />
          <div className="comparison-item">
            <div className="comparison-label">New</div>
            <div className="comparison-value success">3.28</div>
          </div>
        </div> */}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          {/* <button className="btn btn-success flex-1">Confirm Deploy</button> */}
          <button 
            type="button" // <-- Prevents form submission side effects
            onClick={handleArchiveModel} 
            className="btn border-4 border-purple-400 bg-purple-400/30 text-purple-400 hover:bg-purple-400/50 transition-colors flex-1"
          >
            Archive Model
          </button>
        </div>
      </div>
    </div>
  </div>);
};