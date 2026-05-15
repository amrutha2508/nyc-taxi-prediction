import os
from dotenv import load_dotenv
load_dotenv()

MLFLOW_TRACKING_URI     = os.environ["MLFLOW_TRACKING_URI"]
MLFLOW_S3_ENDPOINT_URL  = os.environ["MLFLOW_S3_ENDPOINT_URL"]
MLFLOW_BACKEND_URI      = os.environ["MLFLOW_BACKEND_URI"]
MLFLOW_ARTIFACT_ROOT    = os.environ["MLFLOW_ARTIFACT_ROOT"] 
AWS_ACCESS_KEY_ID       = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY   = os.environ["AWS_SECRET_ACCESS_KEY"]
AWS_DEFAULT_REGION      = os.environ["AWS_DEFAULT_REGION"]
AWS_ENDPOINT_URL_IAM    = os.environ["AWS_ENDPOINT_URL_IAM"]

# MLFLOW_RUN_ID           = os.environ["MLFLOW_RUN_ID"]   # production model
# REDIS_URL               = os.environ["REDIS_URL"]

import os
from dotenv import load_dotenv
from pathlib import Path

# load_dotenv()
# Project root = parent of src/
project_root = Path(__file__).parent.parent.parent
dotenv_path = project_root / ".env"

# # Returns True if the file exists
# print("Does .env exist?", dotenv_path.exists())

if (
    not os.getenv("MLFLOW_S3_ENDPOINT_URL")
    or not os.getenv("MLFLOW_TRACKING_URI")
    or not os.getenv("MLFLOW_BACKEND_URI")
    or not os.getenv("MLFLOW_ARTIFACT_ROOT")
):
    raise ValueError(
        "MLFLOW_S3_ENDPOINT_URL, MLFLOW_TRACKING_URI, MLFLOW_BACKEND_URI and MLFLOW_ARTIFACT_ROOT must be set in .env file"
    )

if (
    not os.getenv("AWS_ACCESS_KEY_ID")
    or not os.getenv("AWS_SECRET_ACCESS_KEY")
    or not os.getenv("AWS_ENDPOINT_URL_IAM")
    or not os.getenv("AWS_DEFAULT_REGION")
):
    raise ValueError(
        "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_IAM and AWS_DEFAULT_REGION must be set in .env file"
    )

# if not os.getenv("REDIS_URL"):
#     raise ValueError("REDIS_URL must be set in .env file")


appConfig = {
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_ENDPOINT_URL_IAM": os.getenv("AWS_ENDPOINT_URL_IAM"),
    "AWS_DEFAULT_REGION": os.getenv("AWS_DEFAULT_REGION"),
    "MLFLOW_S3_ENDPOINT_URL": os.getenv("MLFLOW_S3_ENDPOINT_URL"),
    "MLFLOW_TRACKING_URI": os.getenv("MLFLOW_TRACKING_URI"),
    "MLFLOW_BACKEND_URI": os.getenv("MLFLOW_BACKEND_URI"),
    "MLFLOW_ARTIFACT_ROOT": os.getenv("MLFLOW_ARTIFACT_ROOT"),
    "SUPABASE_API_URL": os.getenv("SUPABASE_API_URL"),
    "SUPABASE_SECRET_KEY": os.getenv("SUPABASE_SECRET_KEY"),
    "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    # "redis_url": os.getenv("REDIS_URL"),
}