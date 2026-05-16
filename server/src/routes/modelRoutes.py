from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from src.db.supabase import supabase
from typing import Any, List, Optional

router = APIRouter( tags=["models"])
class ModelRegistry(BaseModel):
    id: str
    job_id: str
    run_id: str
    model_name: str
    version: dict
    status: str
    created_at: str
    artifact_uri: Optional[str] = None

@router.get("/")
@router.get("")
async def get_models():
    try:
        # Querying the public schema using your initialized supabase client
        response = supabase.table("model_registry").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobdetails/{job_id}")
async def get_model_details(job_id:str):
    try:
        response = supabase.table("training_jobs").select("*").eq("job_id", job_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
