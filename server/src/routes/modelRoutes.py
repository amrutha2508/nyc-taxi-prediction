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

@router.post("/stage/{model_id}")
async def stage_model(model_id:str):
    # 'candidate', 'staging', 'production', 'archived'
    try:
        response = (
            supabase.table("model_registry")
            .update({"status": "staging"})
            .eq("id", model_id)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deploy/{model_id}")
async def deploy_model(model_id: str):
    try:
        # 1. Demote the active production model to 'archived'
        # We target any model that currently has the status 'production'
        supabase.table("model_registry") \
            .update({"status": "archived"}) \
            .eq("status", "production") \
            .execute()
            
        # 2. Promote the target candidate/staging model to 'production'
        response = (
            supabase.table("model_registry")
            .update({"status": "production"})
            .eq("id", model_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(
                status_code=404, 
                detail=f"Model with ID {model_id} not found in registry."
            )
            
        return {
            "message": "Model deployed successfully. Previous production model archived.",
            "data": response.data
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/archive/{model_id}")
async def deploy_model(model_id: str):
    try:

        response = (
            supabase.table("model_registry")
            .update({"status": "archived"})
            .eq("id", model_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(
                status_code=404, 
                detail=f"Model with ID {model_id} not found in registry."
            )
            
        return {
            "message": "Model deployed successfully. Previous production model archived.",
            "data": response.data
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    