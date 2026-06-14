import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_docs_available():
    response = client.get("/docs")
    assert response.status_code == 200

def test_predict_validation_error():
    # Sending empty JSON
    response = client.post("/api/v1/predict", json={})
    assert response.status_code == 422 # Unprocessable Entity
