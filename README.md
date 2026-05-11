# nyc-taxi-prediction

```
server/
│
├── .env
├── .env.example
├── pyproject.toml
├── poetry.lock
├── Procfile                        # Railway start commands
├── README.md
│
├── notebooks/
│   ├── 01_eda.ipynb                # exploratory data analysis
│   ├── 02_feature_engineering.ipynb
│   ├── 03_training_experiment.ipynb
│   └── 04_model_evaluation.ipynb
│
├── src/
│   │
│   ├── train/
│   │   ├── __init__.py
│   │   ├── train_model.py          # main training script
│   │   ├── feature_engineering.py  # feature transforms (shared)
│   │   └── evaluate.py             # rmse, mae, r2 calculations
│   │
│   ├── predict/
│   │   ├── __init__.py
│   │   ├── predict.py              # batch + single prediction logic
│   │   └── feature_engineering.py  # symlink or import from train/
│   │
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── ingest.py               # fetch parquet, call /predict, store results
│   │   └── scheduler.py            # APScheduler setup
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── app.py                  # Flask app entry point
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── predict.py          # POST /predict
│   │   │   └── model.py            # POST /reload, GET /health
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── prediction.py       # Pydantic input/output schemas
│   │
│   ├── celery_app/
│   │   ├── __init__.py
│   │   ├── worker.py               # Celery app init
│   │   └── tasks/
│   │       ├── __init__.py
│   │       └── train_task.py       # train_model Celery task
│   │
│   ├── mlflow_server/
│   │   ├── __init__.py
│   │   └── server.py               # MLflow server start script
│   │
│   └── db/
│       ├── __init__.py
│       ├── supabase_client.py      # Supabase client singleton
│       └── queries/
│           ├── __init__.py
│           ├── datasets.py         # dataset table queries
│           ├── predictions.py      # predictions table queries
│           ├── models.py           # models table queries
│           └── training_jobs.py    # training_jobs table queries
│
├── config/
│   ├── __init__.py
│   └── settings.py                 # all env vars loaded in one place
│
└── tests/
    ├── test_train.py
    ├── test_predict.py
    └── test_api.py
```