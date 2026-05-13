from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.ingestion.register import register_dataset
from pydantic import BaseModel
from src.db.supabase import supabase

router = APIRouter( tags=["Datasets"])

# Ensure your DatasetCreate model matches the expected input (year/month)
class DatasetCreate(BaseModel):
    year: int
    month: int

@router.post("/")
@router.post("")
def add_dataset(
    dataset: DatasetCreate,
    background_tasks: BackgroundTasks
):
    """
    Endpoint to manually trigger the ingestion of a specific NYC Green Taxi dataset.
    Uses BackgroundTasks to prevent the HTTP request from timing out during processing.
    """
    try:
        # Since processing a Parquet file and calculating stats can take a few seconds,
        # running it as a background task is better for UX.
        background_tasks.add_task(register_dataset, dataset.year, dataset.month)
        
        return {
            "message": f"Ingestion started for {dataset.month}/{dataset.year}. Statistics will be available shortly.",
            "status": "processing"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to initiate dataset ingestion: {str(e)}"
        )


@router.get("/")
@router.get("")
def get_datasets():
    """
    Fetches all dataset metadata from the public.datasets table.
    """
    try:
        # Querying the public schema using your initialized supabase client
        response = supabase.table("datasets").select("*").order("added_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))