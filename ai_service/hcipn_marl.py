import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from collections import deque
from typing import List, Dict

# Academic Concept: Deep Policy Network for Multi-Agent Systems
class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, action_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# Academic Concept: Multi-Agent Deep Q-Network (MADQN) Controller
class ClusterAgent:
    def __init__(self, state_dim=5, action_dim=6):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        
        self.model = PolicyNetwork(state_dim, action_dim)
        self.target_model = PolicyNetwork(state_dim, action_dim)
        self.update_target_model()
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)

    def update_target_model(self):
        self.target_model.load_state_dict(self.model.state_dict())

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_dim)
        state = torch.FloatTensor(state).unsqueeze(0)
        act_values = self.model(state)
        return torch.argmax(act_values[0]).item()

    def replay(self, batch_size=32):
        if len(self.memory) < batch_size:
            return
        
        minibatch = random.sample(self.memory, batch_size)
        for state, action, reward, next_state, done in minibatch:
            target = reward
            if not done:
                next_state_t = torch.FloatTensor(next_state).unsqueeze(0)
                target = (reward + self.gamma * torch.max(self.target_model(next_state_t)[0]).item())
            
            state_t = torch.FloatTensor(state).unsqueeze(0)
            target_f = self.model(state_t)
            target_f[0][action] = target
            
            self.optimizer.zero_grad()
            loss = nn.MSELoss()(self.model(state_t), target_f)
            loss.backward()
            self.optimizer.step()

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

# High-Level Coordinator for the Research Experiment
class HCIPN_Coordinator:
    def __init__(self, num_agents=5):
        self.agents = [ClusterAgent() for _ in range(num_agents)]
        self.num_agents = num_agents

    def step_all(self, states, rewards, next_states, done):
        """
        Learns from all agents' experiences collectively.
        """
        for i in range(self.num_agents):
            self.agents[i].remember(states[i], 0, rewards[i], next_states[i], done)
            if self.agents[i].epsilon > 0.1: # Only replay while exploring
                self.agents[i].replay()
                
    def get_actions(self, states):
        """
        Converts policy network outputs to environment actions.
        Action Map:
        0: Do Nothing
        1: Reorder (Low)
        2: Reorder (High)
        3: Borrow from Left Neighbor
        4: Borrow from Right Neighbor
        5: Dynamic Price Increase (5%)
        6: Dynamic Price Decrease (5%)
        """
        actions = {}
        for i in range(self.num_agents):
            raw_action = self.agents[i].act(states[i])
            if raw_action == 0:
                actions[i] = {"type": "IDLE"}
            elif raw_action == 1:
                actions[i] = {"type": "REORDER", "qty": 20}
            elif raw_action == 2:
                actions[i] = {"type": "REORDER", "qty": 50}
            elif raw_action == 3:
                actions[i] = {"type": "BORROW", "qty": 10, "target": (i-1)%self.num_agents}
            elif raw_action == 4:
                actions[i] = {"type": "BORROW", "qty": 10, "target": (i+1)%self.num_agents}
            elif raw_action == 5:
                actions[i] = {"type": "PRICE", "new_price": 105.0} # Placeholder
            else:
                actions[i] = {"type": "PRICE", "new_price": 95.0} # Placeholder
        return actions

hcipn_controller = HCIPN_Coordinator()
