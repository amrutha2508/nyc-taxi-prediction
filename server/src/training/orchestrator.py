import mlflow
import pandas as pd
from src.db.supabase import supabase
from .train_model import (
    train_model, MODELS, read_dataframe, 
    build_features, TARGET
)

def handle_frontend_training(model_name: str, custom_params: dict, dataset_ids: list[str]):
    """
    Adapter to bridge the Frontend Request -> MLflow Training -> Supabase Job Update
    """
    # 1. Fetch URLs from Supabase based on the UUIDs from the UI
    res = supabase.table("datasets").select("url, month_year").in_("id", dataset_ids).execute()
    urls = [row['url'] for row in res.data]
    months = [row['month_year'] for row in res.data]

    # 2. Load and Combine Datasets
    # We load all selected months and split them 80/20 for Train/Val
    full_df = pd.concat([read_dataframe(url) for url in urls], ignore_index=True)
    
    train_df = full_df.sample(frac=0.8, random_state=42)
    val_df = full_df.drop(train_df.index)

    # 3. Prepare Inputs for your train_model function
    dict_train = build_features(train_df)
    dict_val = build_features(val_df)
    y_train = train_df[TARGET].values
    y_val = val_df[TARGET].values

    # 4. Merge UI params with Model Config
    # This takes your default dict from MODELS and overrides the params with the JSON from the UI
    config = MODELS[model_name].copy()
    config["params"] = custom_params 

    # 5. Call your existing train_model function (with all its MLflow logging)
    metrics = train_model(
        model_name=model_name,
        config=config,
        dict_train=dict_train,
        dict_val=dict_val,
        y_train=y_train,
        y_val=y_val,
        train_url="; ".join(months), # Using the month names as the URL tag
        val_url="Validation Split",
        train_size=len(train_df),
        val_size=len(val_df)
    )

    # 6. Extract the Run ID from the MLflow run that just finished
    # Since train_model uses 'with mlflow.start_run()', we grab the last active run
    last_run = mlflow.last_active_run()
    run_id = last_run.info.run_id if last_run else None

    # 7. Update your 'training_jobs' table in Supabase
    supabase.table("training_jobs").insert({
        "run_id": run_id,
        "model_type": model_name,
        "parameters": custom_params,
        "train_dataset_ids": dataset_ids,
        "status": "completed",
        "val_rmse": metrics["val_rmse"],
        "duration": f"{metrics['total_runtime_sec']}s",
        "train_rmse": metrics["train_rmse"]
    }).execute()

    return run_id