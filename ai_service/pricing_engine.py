import numpy as np
import random
import pickle
import os

class PricingAgent:
    def __init__(self, learning_rate=0.1, discount_factor=0.9, epsilon=0.1):
        self.q_table = {}  # State -> Action values
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.actions = [0.8, 0.9, 1.0, 1.1, 1.2]  # Price multipliers
        self.model_file = "pricing_model.pkl"
        self.load_model()

    def get_state_key(self, stock_level, days_to_expiry, competitor_price_ratio):
        # Discretize state space to make Q-table manageable
        stock_bin = "low" if stock_level < 20 else "med" if stock_level < 50 else "high"
        expiry_bin = "urgent" if days_to_expiry < 7 else "soon" if days_to_expiry < 30 else "safe"
        comp_bin = "cheaper" if competitor_price_ratio < 0.95 else "expensive" if competitor_price_ratio > 1.05 else "equal"
        return (stock_bin, expiry_bin, comp_bin)

    def choose_action(self, state):
        if random.uniform(0, 1) < self.epsilon:
            return random.choice(self.actions)  # Explore
        
        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in self.actions}
            
        return max(self.q_table[state], key=self.q_table[state].get)  # Exploit

    def learn(self, state, action, reward, next_state):
        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in self.actions}
        if next_state not in self.q_table:
            self.q_table[next_state] = {a: 0.0 for a in self.actions}

        current_q = self.q_table[state][action]
        max_next_q = max(self.q_table[next_state].values())
        
        new_q = current_q + self.lr * (reward + self.gamma * max_next_q - current_q)
        self.q_table[state][action] = new_q
        self.save_model()

    def suggest_price(self, base_price, current_stock, days_to_expiry, competitor_price):
        ratio = competitor_price / base_price if base_price > 0 else 1.0
        state = self.get_state_key(current_stock, days_to_expiry, ratio)
        action = self.choose_action(state)
        
        suggested_price = base_price * action
        explanation = f"Adjusted by {int((action-1)*100)}% based on {state[0]} stock and {state[1]} expiry."
        
        return {
            "suggested_price": round(suggested_price, 2),
            "multiplier": action,
            "explanation": explanation,
            "state_debug": state
        }

    def save_model(self):
        try:
            with open(self.model_file, 'wb') as f:
                pickle.dump(self.q_table, f)
        except Exception as e:
            print(f"Error saving model: {e}")

    def load_model(self):
        try:
            if os.path.exists(self.model_file):
                with open(self.model_file, 'rb') as f:
                    self.q_table = pickle.load(f)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.q_table = {}

# Singleton instance
pricing_agent = PricingAgent()
