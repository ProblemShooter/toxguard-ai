from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Toxicity Classification API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Model
    MODEL_PATH: str = "model/toxicity.h5"
    VOCAB_PATH: str = "model/vocab.pkl"
    
    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    class Config:
        case_sensitive = True

settings = Settings()
