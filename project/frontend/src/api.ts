import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ClassPrediction {
  probability: number;
  flag: boolean;
}

export interface PredictionResponse {
  text: string;
  predictions: Record<string, ClassPrediction>;
  is_toxic: boolean;
}

export const api = {
  async predict(text: string): Promise<PredictionResponse> {
    const response = await axios.post(`${API_URL}/predict`, { text });
    return response.data;
  },
  
  async checkHealth(): Promise<{ status: string }> {
    const response = await axios.get(`${API_URL.replace('/api/v1', '')}/health`);
    return response.data;
  }
};
