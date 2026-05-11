import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# 1. Load variables from .env file
# Explicitly locate the .env file
env_path = Path(__file__).parent / '.env'

if not env_path.exists():
    raise FileNotFoundError(f"Could not find .env file at {env_path}")

# Load variables
load_dotenv(dotenv_path=env_path)

# 2. Map Tigris-specific variables to MLflow/S3 standards
# This ensures the underlying boto3 client knows where to go
os.environ["MLFLOW_S3_ENDPOINT_URL"] = os.getenv("MLFLOW_S3_ENDPOINT_URL")
os.environ["AWS_DEFAULT_REGION"] = os.getenv("AWS_REGION", "auto")

# 3. Define the MLflow command
# You can also move these strings into your .env file if you prefer
cmd = [
    "mlflow", "server",
    "--backend-store-uri", os.environ["MLFLOW_BACKEND_URI"],
    "--default-artifact-root", os.environ["MLFLOW_ARTIFACT_ROOT"],
    "--host", "0.0.0.0",
    "--port", "5001"
]

if __name__ == "__main__":
    print(f"Starting MLflow with endpoint: {os.environ.get('MLFLOW_S3_ENDPOINT_URL')}")
    try:
        # Run the server and keep the script alive
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nStopping MLflow server...")