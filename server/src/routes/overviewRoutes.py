from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from src.db.supabase import supabase
from typing import Any, List, Optional

router = APIRouter( tags=["models"])
class EvaluationMetrics(BaseModel):
    id: str
    job_id: str
    run_id: str
    model_name: str
    version: dict
    status: str
    created_at: str
    artifact_uri: Optional[str] = None

@router.get("/metrics")
async def get_simulation_metrics():
    try:
        # Querying the public schema using your initialized supabase client
        response = supabase.table("view_simulation_timeplot").select("*").order("simulated_date", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))