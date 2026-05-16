from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.ingestion.register import register_dataset
from pydantic import BaseModel
from src.db.supabase import supabase
from src.training.orchestrator import handle_frontend_training
from typing import Any, List, Optional
from fastapi import HTTPException
import mlflow
from dotenv import load_dotenv
import os

load_dotenv()

# 2. Extract the string from the environment variables safely
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI")

# 3. Pass it to mlflow (with a safety check)
if not MLFLOW_TRACKING_URI:
    raise ValueError("MLFLOW_TRACKING_URI is missing from your .env file!")

mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

router = APIRouter( tags=["training"])
class TrainingRequest(BaseModel):
    modelType: str
    params: dict
    datasets: list[str] # List of UUID strings

class RegisterRequest(BaseModel):
    job_id: str
    run_id: str
    model_type: str
    parameters: dict
    status: str
    val_rmse: float
    train_rmse: float
    duration: str
    created_at: str
    artifact_uri: Optional[str] = None
    train_dataset_ids: List[str]
    val_dataset_ids: List[str]
    is_registered: bool


@router.get('/jobs')
def get_jobs():
    # This logic tells Supabase: "Get jobs, and for every ID in dataset_ids, 
    # find the matching month in the datasets table"
    print("api/training/jobs enpoint is called")
    response = supabase.table("training_jobs") \
        .select("*") \
        .execute()
    return response.data

@router.post('/train')
async def start_training(req: TrainingRequest, background_tasks: BackgroundTasks):
    try:
        # Move training to background so the API returns immediately
        background_tasks.add_task(
            handle_frontend_training, 
            req.modelType, 
            req.params, 
            req.datasets
        )
        return {"status": "success", "message": "Training job started in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register")
def register_model(data: RegisterRequest):
    print("input data:", data)
    
    job_id = data.job_id
    model_name = data.model_type
    run_id = data.run_id # Pull run_id directly from incoming request data

    try:
        # 1. Fetch the job details from Supabase
        job = supabase.table("training_jobs").select("*").eq("job_id", job_id).single().execute()
        if not job.data:
            raise HTTPException(status_code=404, detail="Job execution data not found.")

        # 2. Get the latest version number for this model name from Supabase
        latest = (
            supabase.table("model_registry")
            .select("version")
            .eq("model_name", model_name)
            .order("version", desc=True)
            .limit(1)
            .execute()
        )
        new_version = (latest.data[0]['version'] + 1) if latest.data else 1

        # 3. Register the Model in MLflow
        # MLflow points this run ID to its configured S3 bucket destination automatically
        model_uri = f"runs:/{run_id}/model"
        
        # We use a unified model name in the MLflow registry (e.g., 'nyc-taxi-regressor')
        mlflow_registry_name = "nyc-taxi-regressor" 
        
        mlflow_version_details = mlflow.register_model(
            model_uri=model_uri, 
            name=mlflow_registry_name
        )

        # Extract the S3 location from MLflow metadata
        # e.g., 's3://your-mlflow-bucket/artifacts/1/3e8147.../artifacts/model'
        s3_artifact_uri = mlflow_version_details.source

        # 4. Insert into Supabase Registry (including our new S3 reference)
        supabase.table("model_registry").insert({
            "model_name": model_name,
            "version": new_version,
            "run_id": run_id,
            "job_id": job_id,
            "status": "candidate",
            "artifact_uri": s3_artifact_uri, # <-- Saving the S3 location here
            "metrics": {
                "train_rmse": job.data['train_rmse'],
                "val_rmse": job.data['val_rmse']
            }
        }).execute()
        
        # 5. Update the source training job status
        supabase.table("training_jobs").update({"is_registered": True}).eq("job_id", job_id).execute()

        return {
            "status": "success",
            "supabase_version": new_version,
            "mlflow_version": mlflow_version_details.version,
            "s3_location": s3_artifact_uri
        }

    except Exception as e:
        print(f"Registration process failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))