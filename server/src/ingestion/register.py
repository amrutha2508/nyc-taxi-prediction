from datetime import datetime
from src.db.supabase import supabase
from .processors import extract_dataset_info
import pandas as pd
import math

def make_json_safe(obj):
    """
    Recursively converts dictionary values to JSON-compatible types.
    Handles: Timestamps, NaT, NaN, and Inf.
    """
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_safe(i) for i in obj]
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0  # JSON doesn't support NaN/Inf
        return obj
    elif pd.isna(obj): # Handles NaT (Not a Time)
        return None
    return obj 

def register_dataset(year: int, month: int):
    # 1. Get stats from the processor
    print(f"DEBUG: Background task started for {month}/{year}")
    stats = extract_dataset_info(year, month)
    safe_metadata = make_json_safe(stats["metadata"])
    if not stats:
        return {"success": False, "error": "Failed to fetch or process data"}

    month_label = f"{datetime(year, month, 1).strftime('%B %Y')}"

    # 2. Prepare payload for 'public.datasets'
    dataset_entry = {
        "month_year": month_label,
        "url": stats["url"],
        "row_count": stats["rows"],
        "avg_distance": round(stats["avg_distance"], 2),
        "avg_duration": round(stats["avg_duration"], 2),
        "outlier_percentage": round(stats["outliers"], 2),
        "metadata": safe_metadata
    }

    # 3. Upsert to Supabase
    try:
        response = supabase.table("datasets").upsert(
            dataset_entry, on_conflict="month_year"
        ).execute()
        print(f"DEBUG: Ingestion successful for {month}/{year}")
        return {"success": True, "data": response.data}
    except Exception as e:
        print(f"ERROR: Background task failed: {e}")
        return {"success": False, "error": str(e)}