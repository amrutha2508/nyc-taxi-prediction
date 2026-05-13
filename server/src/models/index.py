from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class DatasetCreate(BaseModel):
    month: str = Field(..., description="year of the dataset")
    year: str = Field(..., description="month of the dataset")