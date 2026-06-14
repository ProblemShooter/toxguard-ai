# ToxGuard AI - Toxic Comment Classification System 🛡️

![ToxGuard AI](https://via.placeholder.com/1200x400/0F172A/3B82F6?text=ToxGuard+AI)

## Overview

**ToxGuard AI** is a production-ready, full-stack application that leverages Deep Learning to automatically classify and detect toxicity in text comments. Originally prototyped in a Jupyter Notebook, the project has been fully re-architected into a robust SaaS-like product.

It detects 6 different categories of toxicity:
- Toxic
- Severe Toxic
- Obscene
- Threat
- Insult
- Identity Hate

## Architecture 🏗️

The project follows a modern decoupled architecture:

- **Frontend**: React + TypeScript + Vite, styled with TailwindCSS, and animated with Framer Motion.
- **Backend API**: High-performance asynchronous API built with FastAPI (Python 3.9+).
- **ML Model**: TensorFlow/Keras Deep Learning model utilizing a Bidirectional LSTM with word embeddings.
- **Infrastructure**: Fully Dockerized for seamless deployment.

### Directory Structure

```text
project/
├── backend/                # FastAPI Application & ML Inference
│   ├── main.py             # API Entrypoint
│   ├── config.py           # Environment Variables & Configuration
│   ├── model/              # Model Weights and Vocabulary
│   ├── services/           # Business Logic
│   ├── utils/              # Helper Scripts & Schemas
│   └── scripts/            # Setup scripts (extract_vocab.py)
├── frontend/               # React Vite Application
│   ├── src/                # UI Components & Hooks
│   └── tailwind.config.js  # Styling Configuration
├── docker-compose.yml      # Orchestration
├── tests/                  # Unit and Integration Tests
└── docs/                   # Architecture and Deployment docs
```

## Getting Started 🚀

### Prerequisites
- Docker and Docker Compose (recommended)
- Python 3.9+ (if running locally)
- Node.js 18+ (if running locally)

### Setup the ML Model

Before running the application, ensure the model and vocabulary are present:
1. Ensure `toxicity.h5` is placed in `backend/model/`.
2. Ensure `vocab.pkl` is placed in `backend/model/` (Already generated and ready to go).

### Run with Docker Compose

The fastest way to get started is using Docker Compose:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

## Features ✨

- **Real-time Inference**: Fast processing of comments using an optimized LSTM model.
- **Interactive UI**: Modern, dark-themed UI that feels like a premium SaaS product.
- **Result History**: Keeps track of recent predictions using local storage.
- **Mobile Responsive**: Works beautifully on mobile and desktop devices.
- **Security**: Implements API rate limiting, security headers, and robust error handling.

## Deployment ☁️

Check out the `docs/deployment.md` for instructions on how to deploy ToxGuard AI to:
- Render
- Railway
- Hugging Face Spaces

## Testing 🧪

To run the automated tests for the backend API:

```bash
cd backend
pip install -r requirements.txt
pytest ../tests/
```

## Contributing 🤝

Contributions are welcome! Please open an issue or submit a pull request.
