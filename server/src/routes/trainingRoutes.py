from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.ingestion.register import register_dataset
from pydantic import BaseModel
from src.db.supabase import supabase
from src.training.orchestrator import handle_frontend_training
from typing import Any, List, Optional

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
def register_model(data:RegisterRequest):
    print("input data:", data)
    # 1. Fetch the job details from Supabase
    job_id = data.job_id
    model_name = data.model_type
    job = supabase.table("training_jobs").select("*").eq("job_id", job_id).single().execute()
    
    # 2. Get the latest version number for this model name
    latest = supabase.table("model_registry") \
        .select("version") \
        .eq("model_name", model_name) \
        .order("version", desc=True) \
        .limit(1).execute()
    
    new_version = (latest.data[0]['version'] + 1) if latest.data else 1

    # 3. Insert into Registry
    supabase.table("model_registry").insert({
        "model_name": model_name,
        "version": new_version,
        "run_id": job.data['run_id'],
        "job_id": job_id,
        # "status": status,
        "metrics": {
            "train_rmse": job.data['train_rmse'],
            "val_rmse": job.data['val_rmse']
        }
    }).execute()
    
    # 4. Update the job status
    supabase.table("training_jobs").update({"is_registered": True}).eq("job_id", job_id).execute()


