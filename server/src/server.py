from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.datasetRoutes import router as datasetRoutes
from src.routes.trainingRoutes import router as trainingRoutes
from src.routes.modelRoutes import router as modelRoutes
from src.routes.overviewRoutes import router as overviewRoutes

app = FastAPI(
    title = "MLOps Application",
    description = "Backend API for MLOps Application",
    version = "1.0.0",
    redirect_slashes=False,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(datasetRoutes, prefix="/api/datasets")
app.include_router(trainingRoutes, prefix="/api/training")
app.include_router(modelRoutes, prefix="/api/models")
app.include_router(overviewRoutes, prefix="/api/overview")
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app,host="0.0.0.0",port = 8000, reload=True)
