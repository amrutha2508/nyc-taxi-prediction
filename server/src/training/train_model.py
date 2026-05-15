import time
import pandas as pd
import numpy as np

from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

from sklearn.metrics import root_mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

import mlflow

from src.config.settings import appConfig

from typing import Any

FeatureDict = list[dict[str, Any]]
MetricsDict = dict[str, Any]

# ── MLflow setup ──────────────────────────────────────────
mlflow.set_tracking_uri(appConfig["MLFLOW_TRACKING_URI"])
mlflow.set_experiment("nyc-taxi-experiment")


# ── Model registry ────────────────────────────────────────
MODELS = {
    "linear_regression": {
        "model": LinearRegression(),
        "params": {},
        "use_scaler": True,
    },
    "lasso": {
        "model": Lasso(),
        "params": {"alpha": 0.01},
        "use_scaler": True,
    },
    "random_forest": {
        "model": RandomForestRegressor(
            n_jobs=-1,
            random_state=0
        ),
        "params": {
            "max_depth": 20,
            "n_estimators": 100,
            "min_samples_leaf": 10,
        },
        "use_scaler": False,
    },
    "xgboost": {
        "model": XGBRegressor(
            n_jobs=-1,
            random_state=0
        ),
        "params": {
            "max_depth": 6,
            "n_estimators": 100,
            "learning_rate": 0.1,
        },
        "use_scaler": False,
    },
}


# ── Feature config ────────────────────────────────────────
CATEGORICAL_FEATURES = ["PULocationID", "DOLocationID"]
NUMERICAL_FEATURES = ["trip_distance"]
TARGET = "duration"


# ── Data loading ──────────────────────────────────────────
def read_dataframe(filename: str) -> pd.DataFrame:
    df = pd.read_parquet(filename)

    df["duration"] = (
        df.lpep_dropoff_datetime - df.lpep_pickup_datetime
    ).dt.total_seconds() / 60

    df = df[
        (df["duration"] >= 1) &
        (df["duration"] <= 60)
    ].copy()

    df[CATEGORICAL_FEATURES] = (
        df[CATEGORICAL_FEATURES].astype(str)
    )

    return df


# ── Feature engineering ───────────────────────────────────
def build_features(df: pd.DataFrame) -> list[dict]:

    df = df.copy()

    df["PU_DO"] = (
        df["PULocationID"] + "_" + df["DOLocationID"]
    )

    categorical = ["PU_DO"]
    numerical = NUMERICAL_FEATURES

    return df[categorical + numerical].to_dict(
        orient="records"
    )


# ── Single model trainer ──────────────────────────────────
def train_model(
    model_name: str,
    config: dict[str, Any],
    dict_train: FeatureDict,
    dict_val: FeatureDict,
    y_train: np.ndarray,
    y_val: np.ndarray,
    train_url: str,
    val_url: str,
    train_size: int,
    val_size: int,
) -> MetricsDict:

    print(f"\nTraining {model_name}...")

    start_time = time.time()

    with mlflow.start_run():

        mlflow.set_tag("model_name", model_name)

        mlflow.set_tag("train_url", train_url)
        mlflow.set_tag("val_url", val_url)

        mlflow.set_tag("train_size", train_size)
        mlflow.set_tag("val_size", val_size)

        model = config["model"].set_params(
            **config["params"]
        )

        mlflow.log_params(config["params"])

        steps = [DictVectorizer()]

        if config["use_scaler"]:
            steps.append(
                StandardScaler(with_mean=False)
            )

        steps.append(model)

        pipeline = make_pipeline(*steps)

        # ── TRAIN ───────────────────────
        fit_start = time.time()

        pipeline.fit(dict_train, y_train)

        fit_end = time.time()

        training_time = fit_end - fit_start

        # ── EVALUATE ────────────────────
        y_pred_train = pipeline.predict(dict_train)
        y_pred_val = pipeline.predict(dict_val)

        train_rmse = root_mean_squared_error(
            y_train,
            y_pred_train,
        )

        val_rmse = root_mean_squared_error(
            y_val,
            y_pred_val,
        )

        rmse_gap = val_rmse - train_rmse

        # ── LOG METRICS ─────────────────
        mlflow.log_metric(
            "train_rmse",
            train_rmse
        )

        mlflow.log_metric(
            "val_rmse",
            val_rmse
        )

        mlflow.log_metric(
            "rmse_gap",
            rmse_gap
        )

        mlflow.log_metric(
            "training_time_seconds",
            training_time
        )

        # ── SAVE MODEL ──────────────────
        mlflow.sklearn.log_model(
            pipeline,
            artifact_path="model"
        )

        total_runtime = time.time() - start_time

        print(
            f"train_rmse={train_rmse:.4f} | "
            f"val_rmse={val_rmse:.4f} | "
            f"train_time={training_time:.2f}s"
        )

        return {
            "model": model_name,
            "train_rmse": round(train_rmse, 4),
            "val_rmse": round(val_rmse, 4),
            "gap": round(rmse_gap, 4),
            "train_time_sec": round(training_time, 2),
            "total_runtime_sec": round(total_runtime, 2),
        }


# ── Main training orchestrator ────────────────────────────
def train_models(
    train_url: str,
    val_url: str,
    model_name: str | None = None,
):

    print("Loading data...")

    df_train = read_dataframe(train_url)
    df_val = read_dataframe(val_url)

    print(
        f"Train size: {len(df_train):,} | "
        f"Val size: {len(df_val):,}"
    )

    dict_train = build_features(df_train)
    dict_val = build_features(df_val)

    y_train = df_train[TARGET].values
    y_val = df_val[TARGET].values

    # ── choose models ─────────────────
    if model_name:

        if model_name not in MODELS:
            raise ValueError(
                f"Unknown model: {model_name}"
            )

        selected_models = {
            model_name: MODELS[model_name]
        }

    else:
        selected_models = MODELS

    results = []

    for name, config in selected_models.items():

        result = train_model(
            model_name=name,
            config=config,
            dict_train=dict_train,
            dict_val=dict_val,
            y_train=y_train,
            y_val=y_val,
            train_url=train_url,
            val_url=val_url,
            train_size=len(df_train),
            val_size=len(df_val),
        )

        results.append(result)

    # ── summary ───────────────────────
    results_df = (
        pd.DataFrame(results)
        .sort_values("val_rmse")
    )

    print("\n── Results ─────────────────────────")
    print(results_df.to_string(index=False))

    return results_df


if __name__ == "__main__":

    TRAIN_URL = (
        "https://d37ci6vzurychx.cloudfront.net/"
        "trip-data/green_tripdata_2021-01.parquet"
    )

    VAL_URL = (
        "https://d37ci6vzurychx.cloudfront.net/"
        "trip-data/green_tripdata_2021-02.parquet"
    )

    # ── Train ALL models ──────────────
    train_models(
        train_url=TRAIN_URL,
        val_url=VAL_URL,
    )

    # ── Train ONE model ───────────────
    # train_models(
    #     train_url=TRAIN_URL,
    #     val_url=VAL_URL,
    #     model_name="xgboost",
    # )