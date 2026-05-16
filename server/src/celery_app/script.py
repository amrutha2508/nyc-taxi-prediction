import os
import time
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
from sklearn.metrics import root_mean_squared_error # Scikit-learn 1.4+ style
from src.db.supabase import supabase
import mlflow
from src.config.settings import appConfig
import gc
# ── MLflow setup ──────────────────────────────────────────
mlflow.set_tracking_uri(appConfig["MLFLOW_TRACKING_URI"])
# mlflow.set_experiment("nyc-taxi-experiment")

# --- CONFIGURATION ---
SIMULATION_SPEED_MINUTES_PER_MONTH = 10
DAYS_IN_MONTH = 30 
# 10 mins * 60 secs / 30 days = 20 seconds per historical day
LOOP_INTERVAL = (SIMULATION_SPEED_MINUTES_PER_MONTH * 60) / DAYS_IN_MONTH 

# NYC Taxi CloudFront base URL (Yellow taxi example)
BASE_URL = "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_{year}-{month:02d}.parquet"

def get_active_models():
    """
    Mock function: Fetch current staging and production models from S3/DB.
    Replace this with your actual code that fetches the weights/pipelines.
    """
    response = (
    supabase.table("model_registry")
    .select("*")
    .in_("status", ["production", "staging"])
    .execute()
    )
    data = response.data
    # Corrected list comprehensions
    print("data: ", data)
    prod_model = [x for x in data if x["status"] == "production"]
    staging_model = [x for x in data if x["status"] == "staging"]
    print("prod_model: ", prod_model[0]," staging_model: ", staging_model[0])
    return {"production": prod_model[0], "staging": staging_model[0]}

def store_metrics_to_db(simulated_timestamp, model_record, status, rmse, sample_size, prediction_duration_ms):
    """
    Inserts evaluated simulation metrics and inference time into Supabase.
    """
    try:
        payload = {
            "simulated_date": str(simulated_timestamp.date()),
            "model_id": model_record.get("id"),
            "status": status,
            "metric_name": "RMSE",
            "metric_value": float(rmse),
            "sample_count": int(sample_size),
            "prediction_duration_ms": float(prediction_duration_ms) # <-- Added column
        }
        
        response = supabase.table("model_simulation_metrics").insert(payload).execute()
        
        print(f"[{datetime.now().strftime('%X')}] Saved DB -> Date: {simulated_timestamp.date()} | {status.upper()} | RMSE: {rmse:.4f} | Latency: {prediction_duration_ms:.2f}ms")
        return response
    except Exception as e:
        print(f"Failed writing metrics to database: {e}")

def load_ml_model(model_record):
    """
    Loads the actual executable model from MLflow using the artifact_uri
    from the database record.
    """
    if not model_record:
        return None
    
    # Extract the MLflow URI from your DB response
    model_uri = model_record.get("artifact_uri") 
    
    try:
        print(f"Loading actual model artifact from: {model_uri}")
        # Load it as a generic python function model that has a .predict() method
        return mlflow.pyfunc.load_model(model_uri)
    except Exception as e:
        print(f"Failed to load model from artifact URI: {e}")
        return None

def download_monthly_data(year, month):
    url = BASE_URL.format(year=year, month=month)
    local_file = f"yellow_tripdata_{year}-{month:02d}.parquet"
    
    if not os.path.exists(local_file):
        print(f"Downloading historical data for {year}-{month:02d}...")
        response = requests.get(url)
        if response.status_code == 200:
            with open(local_file, 'wb') as f:
                f.write(response.content)
        else:
            print(f"Failed to download data for {year}-{month}")
            return None
    return local_file
def preprocess_simulation_data(day_data: pd.DataFrame) -> tuple[list[dict], np.ndarray]:
    """
    Preprocesses raw daily simulation data to match the feature schema 
    and format expected by the trained MLflow pipelines.
    """
    df = day_data.copy()
    
    # 1. Determine pickup/dropoff column names dynamically (Yellow vs. Green cabs)
    pickup_col = 'tpep_pickup_datetime' if 'tpep_pickup_datetime' in df.columns else 'lpep_pickup_datetime'
    dropoff_col = 'tpep_dropoff_datetime' if 'tpep_dropoff_datetime' in df.columns else 'lpep_dropoff_datetime'
    
    # 2. Calculate target 'duration' matching training pipeline
    df['duration'] = (
        pd.to_datetime(df[dropoff_col]) - pd.to_datetime(df[pickup_col])
    ).dt.total_seconds() / 60.0
    
    # 3. Filter duration outliers (1 to 60 minutes) exactly like read_dataframe()
    df = df[(df["duration"] >= 1) & (df["duration"] <= 60)].copy()
    
    # If no data left after filtering, return empty collections early
    if len(df) == 0:
        return [], np.array([])
        
    # 4. Extract Target Array
    y_true = df['duration'].values
    
    # 5. Build Features matching build_features()
    df["PULocationID"] = df["PULocationID"].astype(str)
    df["DOLocationID"] = df["DOLocationID"].astype(str)
    df["PU_DO"] = df["PULocationID"] + "_" + df["DOLocationID"]
    
    # 6. Convert to List of Dicts for DictVectorizer
    features_list = ["PU_DO", "trip_distance"]
    X_dict = df[features_list].to_dict(orient="records")
    
    return X_dict, y_true
def run_simulation(start_year=2021, start_month=1):
    current_year = start_year
    current_month = start_month

    # End condition can be tweaked based on your dataset boundaries
    while current_year <= 2026: 
        file_path = download_monthly_data(current_year, current_month)
        if not file_path:
            break
        try:
            # Load month data
            df = pd.read_parquet(file_path)
            
            # Ensure your target variable and datetime index are extracted correctly
            # NYC taxi dataset uses 'tpep_pickup_datetime'
            df['pickup_date'] = pd.to_datetime(df['tpep_pickup_datetime'])
            
            # Group data by day
            grouped = df.groupby(df['pickup_date'].dt.date)
            
            for date, day_data in grouped:
                # Step 1: Extract features and true targets via standalone function
                X_dict, y_true = preprocess_simulation_data(day_data)
                
                # If the day had no valid records (e.g., all outliers), skip evaluating
                if len(X_dict) == 0 or len(y_true) == 0:
                    continue
                # Step 2: Fetch latest models dynamically (in case status changed in UI)
                models = get_active_models() 
                
                # Step 3: Evaluate models
                for status, model_record in models.items():
                    if model_record is not None and len(y_true) > 0:
                        try:
                            # 1. Load the executable model artifact using the DB metadata
                            actual_model = load_ml_model(model_record)
                            if actual_model is not None:
                                
                                # ─── TIME PATTERN FOR INFERENCE SPEED ───
                                start_time = time.perf_counter()
                                y_pred = actual_model.predict(X_dict)
                                end_time = time.perf_counter()
                                
                                # Calculate total wall time in milliseconds
                                total_duration_ms = (end_time - start_time) * 1000.0
                                # Average duration per single trip prediction row
                                avg_duration_per_row_ms = total_duration_ms / len(X_dict)
                                # ────────────────────────────────────────

                                rmse = root_mean_squared_error(y_true, y_pred)
                                
                                # Store using the simulated historical date context
                                simulated_timestamp = datetime.combine(date, datetime.min.time())
                                
                                # Pass your metrics, sample size, and latency out to DB
                                store_metrics_to_db(
                                    simulated_timestamp=simulated_timestamp,
                                    model_record=model_record,
                                    status=status,
                                    rmse=rmse,
                                    sample_size=len(y_true),
                                    prediction_duration_ms=avg_duration_per_row_ms # <-- Added
                                )
                                
                                # --- MANUAL CLEANUP ---
                                del actual_model  
                                gc.collect()      
                        except Exception as e:
                            print(f"Error evaluating {status} model: {e}")
                
                # Step 3: Wait 20 seconds to simulate 1 day passing
                time.sleep(LOOP_INTERVAL)

        finally:
            # 3. This block ALWAYS runs, ensuring clean-up even if code crashes
            if os.path.exists(file_path):
                print(f"Cleaning up local file: {file_path}")
                os.remove(file_path)
            
        # Move to next month
        current_month += 1
        if current_month > 12:
            current_month = 1
            current_year += 1
        

if __name__ == "__main__":
    run_simulation(2021, 2)