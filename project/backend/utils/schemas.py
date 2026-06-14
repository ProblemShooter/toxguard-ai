from pydantic import BaseModel, Field
from typing import Dict, Any

class PredictionRequest(BaseModel):
    text: str = Field(..., title="Comment Text", description="The text of the comment to classify", max_length=5000)

class ClassPrediction(BaseModel):
    probability: float
    flag: bool

class PredictionResponse(BaseModel):
    text: str
    predictions: Dict[str, ClassPrediction]
    is_toxic: bool = Field(..., description="True if any category is flagged")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "You are amazing!",
                "predictions": {
                    "toxic": {"probability": 0.01, "flag": False},
                    "severe_toxic": {"probability": 0.001, "flag": False},
                    "obscene": {"probability": 0.01, "flag": False},
                    "threat": {"probability": 0.001, "flag": False},
                    "insult": {"probability": 0.005, "flag": False},
                    "identity_hate": {"probability": 0.001, "flag": False}
                },
                "is_toxic": False
            }
        }
