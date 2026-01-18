import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict

class DemandLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=100, output_size=1):
        super().__init__()
        self.hidden_layer_size = hidden_layer_size
        self.lstm = nn.LSTM(input_size, hidden_layer_size, batch_first=True)
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq)
        predictions = self.linear(lstm_out[:, -1, :])
        return predictions

class DemandForecaster:
    def __init__(self):
        self.model = DemandLSTM()
        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        self.is_trained = False

    def prepare_data(self, history: List[float], seq_length=7):
        """
        Converts raw history into sliding window sequences for LSTM.
        """
        data = np.array(history).reshape(-1, 1)
        scaled_data = self.scaler.fit_transform(data)
        
        X, y = [], []
        for i in range(len(scaled_data) - seq_length):
            X.append(scaled_data[i:i+seq_length])
            y.append(scaled_data[i+seq_length])
            
        return torch.FloatTensor(np.array(X)), torch.FloatTensor(np.array(y))

    def train_model(self, history: List[float], epochs=50):
        """
        Trains the LSTM model on historical sales data.
        For a research paper, we would include validation splits here.
        """
        if len(history) < 14:
            print("Insufficient data for LSTM training. Minimum 14 points required.")
            return

        X, y = self.prepare_data(history)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        loss_function = nn.MSELoss()

        self.model.train()
        for i in range(epochs):
            optimizer.zero_grad()
            y_pred = self.model(X)
            single_loss = loss_function(y_pred, y)
            single_loss.backward()
            optimizer.step()
            
        self.is_trained = True
        print(f"LSTM Training Complete. Final Loss: {single_loss.item():.6f}")

    def predict_next(self, history: List[float], seq_length=7):
        """
        Predicts next day demand.
        """
        if not self.is_trained:
            # Fallback to simple moving average if not trained
            return sum(history[-3:]) / 3

        self.model.eval()
        last_seq = np.array(history[-seq_length:]).reshape(-1, 1)
        last_seq_scaled = self.scaler.transform(last_seq)
        last_seq_tensor = torch.FloatTensor(last_seq_scaled).unsqueeze(0)
        
        with torch.no_grad():
            prediction_scaled = self.model(last_seq_tensor)
            prediction = self.scaler.inverse_transform(prediction_scaled.numpy())
            
        return max(0, float(prediction[0][0]))

# Singleton instance for the service
forecaster = DemandForecaster()
