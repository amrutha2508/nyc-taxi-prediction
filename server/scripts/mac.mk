.PHONY: dev mlflow

dev:
	osascript -e 'tell app "Terminal" to do script "cd $(PWD) && poetry run uvicorn src.server:app --reload --host 0.0.0.0 --port 8000"'

mlflow:
	osascript -e 'tell app "Terminal" to do script "cd $(PWD) && poetry run python src/mlflow_server/mlflow_run.py"'

run-all: dev mlflow