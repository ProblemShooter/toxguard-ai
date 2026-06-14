import os
import pickle
import tensorflow as tf
from tensorflow.keras.layers import TextVectorization
import numpy as np
from config import settings
import logging

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.classes = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
        
    def load(self):
        logger.info(f"Loading model from {settings.MODEL_PATH}...")
        
        # Optimize TF for memory constrained environments (like Render's 512MB tier)
        tf.config.threading.set_inter_op_parallelism_threads(1)
        tf.config.threading.set_intra_op_parallelism_threads(1)
        
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {settings.MODEL_PATH}")
        self.model = tf.keras.models.load_model(settings.MODEL_PATH, compile=False)
        
        logger.info(f"Loading vocabulary from {settings.VOCAB_PATH}...")
        if not os.path.exists(settings.VOCAB_PATH):
            logger.warning(f"Vocabulary not found at {settings.VOCAB_PATH}. Please run extract_vocab.py.")
            raise FileNotFoundError(f"Vocabulary not found at {settings.VOCAB_PATH}")
            
        with open(settings.VOCAB_PATH, 'rb') as f:
            vocab = pickle.load(f)
            
        # Limit vocabulary size to prevent out-of-memory errors
        vocab = vocab[:20000]
            
        self.vectorizer = TextVectorization(max_tokens=20000,
                                            output_sequence_length=1800,
                                            output_mode='int',
                                            vocabulary=vocab)
        logger.info("Model and vectorizer loaded successfully.")

    def predict(self, text: str) -> dict:
        if self.model is None or self.vectorizer is None:
            logger.info("Lazy loading model on first prediction...")
            self.load()            
        vectorized_text = self.vectorizer(np.array([text]))
        prediction = self.model.predict(vectorized_text)[0]
        
        results = {}
        for idx, col in enumerate(self.classes):
            prob = float(prediction[idx])
            results[col] = {
                "probability": prob,
                "flag": prob > 0.5
            }
            
        return results

model_service = ModelService()
