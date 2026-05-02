from pydantic import BaseModel
from typing import Literal

class PredictionResult(BaseModel):
    mean_income: float
    std_dev_income: float
    probability_deficit: float
    threshold_used: float

class HedgingDecision(BaseModel):
    probability: float
    zone: Literal["Aman", "Waspada", "Kritis", "Bahaya", "Darurat"]
    hedging_percentage: float
    action: str
