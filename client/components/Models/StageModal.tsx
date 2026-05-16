import { apiClient } from "@/lib/api";
import { ArrowRight, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface StageModalProps {
  modelId: string;
  runId: string; // Added runId since it's used in the text
  onClose: () => void;
}

export const StageModal = ({ modelId, onClose }: StageModalProps) => {
  console.log("in staging modal");
  console.log("modelId:", modelId);
  const handleStageModel = async () => {
    console.log("model staging function");
    try {
      console.log("model staging function try:");
      // Fixed the template literal syntax bug here
      const data = await apiClient.post(`/api/models/stage/${modelId}`);
      toast.success("Successfully staged the model");
      console.log("model staging result:", data);
      onClose(); // Close the modal after success
    } catch (error) {
      toast.error("Failed to stage the model");
    }
  };
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="modal-title mb-4">Stage the Model</h2>
          
          <div className="alert alert-warning mb-6">
            <p className="text-sm">
              Staging <span className="font-mono font-bold">{modelId}</span> will allow you to compare evaluation metrics with the current production model.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            {/* Connected the click handler here */}
            <button 
              type="button" // <-- Prevents form submission side effects
              onClick={handleStageModel} 
              className="btn btn-success flex-1"
            >
              Confirm Staging
            </button>
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
    </div>
  );
};