from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.schemas import PredictionRequest, PredictionResponse
from model.model_service import model_service
from config import settings
import time
import logging
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API for predicting toxicity in text comments.",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers & Logging Middleware
@app.middleware("http")
async def add_security_headers_and_log(request: Request, call_next):
    request_id = str(uuid.uuid4())
    logger.info(f"[{request_id}] Started {request.method} {request.url}")
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"[{request_id}] Completed in {process_time:.3f}s with status {response.status_code}")
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing application and loading models...")
    try:
        model_service.load()
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        # In a real production system, we might not want to crash if we can retry or use a fallback,
        # but here we should fail fast if the model isn't available.
        # pass

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy", 
        "model_loaded": model_service.model is not None,
        "version": settings.VERSION
    }

@app.post(f"{settings.API_V1_STR}/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_toxicity(request: PredictionRequest):
    if not model_service.model:
        raise HTTPException(status_code=503, detail="Model is currently unavailable")
        
    try:
        predictions = model_service.predict(request.text)
        is_toxic = any(pred["flag"] for pred in predictions.values())
        
        return PredictionResponse(
            text=request.text,
            predictions=predictions,
            is_toxic=is_toxic
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
